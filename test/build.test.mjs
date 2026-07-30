import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { runGenerator } from './helpers/run-generator.mjs';
import { dockerComposeAvailable, composeBuild } from './helpers/docker.mjs';

// Opt-in only: this builds real images (jeci compiles the Solr 9 fork from
// source), so it pulls from registries and can take many minutes. Enable with
// ADI_DEEP_BUILD=1. Without it, the whole describe block is skipped.
const OPTED_IN = process.env.ADI_DEEP_BUILD === '1';
const TIMEOUT_MS = Number(process.env.ADI_BUILD_TIMEOUT_MS || 20 * 60 * 1000);

// One representative combination per search backend. Repo + Share + proxy build
// contexts are common to every combination, so these four cover all Dockerfiles
// the generator can emit (stock search, jeci multi-stage, opensearch/no-search).
const REPRESENTATIVES = [
  { label: 'acs26.1-alfresco', overrides: { acsVersion: '26.1', searchType: 'alfresco', proxyType: 'nginx' } },
  { label: 'acs26.1-jeci', overrides: { acsVersion: '26.1', searchType: 'jeci', proxyType: 'nginx' } },
  { label: 'acs26.2-opensearch', overrides: { acsVersion: '26.2', searchType: 'opensearch', proxyType: 'nginx' } },
  { label: 'acs26.2-jeci', overrides: { acsVersion: '26.2', searchType: 'jeci', proxyType: 'nginx' } }
];

// Copy the entire generated project (Dockerfiles, build contexts, config) from
// the in-memory mem-fs to a real directory the docker CLI can build from.
function materializeProject(runResult, label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `adi-build-${label}-`));
  fs.cpSync(runResult.cwd, dir, { recursive: true });
  return dir;
}

const skip = !OPTED_IN
  ? 'set ADI_DEEP_BUILD=1 to run real image builds'
  : !dockerComposeAvailable()
    ? 'docker compose unavailable'
    : false;

describe('docker compose build (deep, opt-in)', { skip }, () => {
  for (const { label, overrides } of REPRESENTATIVES) {
    test(label, { timeout: TIMEOUT_MS + 60 * 1000 }, async () => {
      const runResult = await runGenerator(overrides);
      const dir = materializeProject(runResult, label);
      try {
        const { ok, stderr, timedOut } = composeBuild(dir, TIMEOUT_MS);
        assert.ok(
          !timedOut,
          `docker compose build timed out after ${TIMEOUT_MS}ms for ${label}`
        );
        assert.ok(
          ok,
          `docker compose build failed for ${label}:\n${stderr.slice(-4000)}`
        );
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  }
});
