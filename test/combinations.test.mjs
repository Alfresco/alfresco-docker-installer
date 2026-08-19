import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { runGenerator } from './helpers/run-generator.mjs';
import { buildCombinations } from './helpers/combinations.mjs';
import {
  dockerComposeAvailable,
  composeConfig,
  undefinedVariableWarnings
} from './helpers/docker.mjs';

const combinations = buildCombinations();
const hasDocker = dockerComposeAvailable();

// The generated project lives in an in-memory mem-fs under runResult.cwd. Copy
// docker-compose.yml + .env to a real temp dir so the docker CLI can read them.
function materialize(runResult, label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `adi-${label}-`));
  for (const file of ['docker-compose.yml', '.env']) {
    const src = path.join(runResult.cwd, file);
    assert.ok(fs.existsSync(src), `expected generator to produce ${file}`);
    fs.copyFileSync(src, path.join(dir, file));
  }
  return dir;
}

describe(`ACS 26.1 / 26.2 deployment combinations (${combinations.length} total)`, () => {
  before(() => {
    if (!hasDocker) {
      console.warn(
        '\n  [warn] `docker compose` not available - syntactic validation of ' +
        'produced assets will be SKIPPED (generation + structural checks still run).\n'
      );
    }
  });

  for (const { label, overrides } of combinations) {
    test(label, async () => {
      const runResult = await runGenerator(overrides);

      // --- Generation produced the core Docker assets ---
      const compose = fs.readFileSync(
        path.join(runResult.cwd, 'docker-compose.yml'),
        'utf8'
      );
      const env = fs.readFileSync(path.join(runResult.cwd, '.env'), 'utf8');

      // --- Structural expectations that don't need docker ---
      // Repository and its proxy are always present.
      assert.match(compose, /^\s{4}alfresco:/m, 'alfresco service missing');
      assert.match(compose, /^\s{4}proxy:/m, 'proxy service missing');

      // Search tier matches the selected backend.
      if (overrides.searchType === 'opensearch') {
        assert.match(compose, /^\s{4}opensearch:/m, 'opensearch service missing');
        assert.match(compose, /^\s{4}batch-indexer:/m, 'batch-indexer service missing');
        assert.doesNotMatch(compose, /^\s{4}trackers:/m, 'unexpected trackers service');
      } else if (overrides.searchType === 'jeci') {
        assert.match(compose, /^\s{4}solr6:/m, 'solr6 service missing');
        assert.match(compose, /^\s{4}trackers:/m, 'trackers service missing');
        assert.match(env, /^JECI_REPO=/m, 'JECI_REPO missing from .env');
      } else {
        // stock alfresco (26.1 only)
        assert.match(compose, /^\s{4}solr6:/m, 'solr6 service missing');
        assert.doesNotMatch(compose, /^\s{4}trackers:/m, 'unexpected trackers service');
      }

      // OpenSearch Dashboards presence and port exposure match the selection.
      assert.equal(
        /^\s{4}opensearch-dashboards:/m.test(compose),
        Boolean(overrides.opensearchDashboards),
        'opensearch-dashboards service presence does not match selection'
      );
      assert.equal(
        /:5601:5601/.test(compose),
        Boolean(overrides.opensearchDashboards),
        'port 5601 exposure does not match selection'
      );

      // Database service matches the selection.
      assert.match(
        compose,
        overrides.mariadb ? /^\s{4}mariadb:/m : /^\s{4}postgres:/m,
        'database service does not match selection'
      );

      // Proxy image matches the selection.
      if (overrides.proxyType === 'traefik') {
        assert.match(compose, /image:\s*traefik:/, 'traefik image missing');
      } else {
        assert.match(compose, /image:\s*nginx:/, 'nginx image missing');
      }

      // ActiveMQ presence matches the selection.
      assert.equal(
        /^\s{4}activemq:/m.test(compose),
        overrides.activemq,
        'activemq service presence does not match selection'
      );

      // Every ${VAR} referenced in the compose file must be defined in .env
      // (build-time reference to an env key the generator forgot to emit).
      const envKeys = new Set(
        env
          .split('\n')
          .map(l => l.match(/^([A-Z0-9_]+)=/))
          .filter(Boolean)
          .map(m => m[1])
      );
      const referenced = [...compose.matchAll(/\$\{([A-Z0-9_]+)(?::-[^}]*)?\}/g)].map(
        m => m[1]
      );
      for (const key of referenced) {
        // ${BIND_IP_*:-0.0.0.0} style vars have inline defaults and come from
        // the shell/.env at runtime; only assert on *_TAG image pins here.
        if (key.endsWith('_TAG')) {
          assert.ok(envKeys.has(key), `compose references ${key} but .env does not define it`);
        }
      }

      // --- Syntactic validation of the produced assets via docker ---
      if (hasDocker) {
        const dir = materialize(runResult, label);
        try {
          const { ok, stderr } = composeConfig(dir);
          assert.ok(ok, `docker compose config rejected the project:\n${stderr}`);

          const undef = undefinedVariableWarnings(stderr);
          assert.equal(
            undef.length,
            0,
            `unresolved variable interpolation:\n${undef.join('\n')}`
          );
        } finally {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
    });
  }
});
