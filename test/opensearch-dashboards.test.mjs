import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { runGenerator } from './helpers/run-generator.mjs';

// OpenSearch Dashboards is an optional companion of the opensearch search
// backend, which only exists from ACS 26.2. Every other version/backend must
// come out without the service, even when the flag is forced on.

function compose(runResult) {
  return fs.readFileSync(path.join(runResult.cwd, 'docker-compose.yml'), 'utf8');
}

function env(runResult) {
  return fs.readFileSync(path.join(runResult.cwd, '.env'), 'utf8');
}

const DASHBOARDS_SERVICE = /^\s{4}opensearch-dashboards:/m;

describe('OpenSearch Dashboards wiring', () => {
  test('is emitted on ACS 26.2 with the opensearch backend when selected', async () => {
    const runResult = await runGenerator({
      acsVersion: '26.2',
      searchType: 'opensearch',
      opensearchDashboards: true
    });
    const yml = compose(runResult);

    assert.match(yml, DASHBOARDS_SERVICE, 'opensearch-dashboards service missing');
    assert.match(
      yml,
      /image:\s*opensearchproject\/opensearch-dashboards:\$\{OPENSEARCH_DASHBOARDS_TAG\}/,
      'dashboards image pin missing'
    );
    assert.match(yml, /:5601:5601/, 'port 5601 is not exposed');
    assert.match(
      yml,
      /OPENSEARCH_HOSTS=\["http:\/\/opensearch:9200"\]/,
      'dashboards is not pointed at the opensearch service'
    );
    assert.match(
      env(runResult),
      /^OPENSEARCH_DASHBOARDS_TAG=/m,
      'OPENSEARCH_DASHBOARDS_TAG missing from .env'
    );
  });

  test('is omitted on ACS 26.2 with the opensearch backend when not selected', async () => {
    const runResult = await runGenerator({
      acsVersion: '26.2',
      searchType: 'opensearch',
      opensearchDashboards: false
    });
    const yml = compose(runResult);

    assert.doesNotMatch(yml, DASHBOARDS_SERVICE, 'unexpected dashboards service');
    assert.doesNotMatch(yml, /:5601:5601/, 'unexpected port 5601 exposure');
  });

  test('is not emitted for the jeci backend even when forced on', async () => {
    const runResult = await runGenerator({
      acsVersion: '26.2',
      searchType: 'jeci',
      opensearchDashboards: true
    });

    assert.doesNotMatch(compose(runResult), DASHBOARDS_SERVICE, 'unexpected dashboards service');
  });

  test('is not emitted for ACS versions before 26.2 even when forced on', async () => {
    for (const acsVersion of ['25.3', '26.1']) {
      const runResult = await runGenerator({
        acsVersion,
        searchType: 'alfresco',
        solrHttpMode: 'secret',
        opensearchDashboards: true
      });

      assert.doesNotMatch(
        compose(runResult),
        DASHBOARDS_SERVICE,
        `unexpected dashboards service on ACS ${acsVersion}`
      );
    }
  });

  test('memory limits still fit the declared RAM budget when enabled', async () => {
    // The repository limit is derived from the RAM budget, so enabling the
    // dashboards must shrink it rather than oversubscribe the host. Each run
    // must be read before the next one starts: yeoman-test disposes the
    // previous run's directory when a new generator run begins.
    const repoLimit = async opensearchDashboards => {
      const runResult = await runGenerator({
        acsVersion: '26.2',
        searchType: 'opensearch',
        opensearchDashboards,
        ram: '16'
      });
      return Number(compose(runResult).match(/memory:\s*(\d+)m/)[1]);
    };

    const withDashboards = await repoLimit(true);
    const without = await repoLimit(false);

    assert.ok(
      withDashboards < without,
      `enabling dashboards did not reduce the repository memory limit ` +
      `(${withDashboards}m vs ${without}m)`
    );
  });
});
