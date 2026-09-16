import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { runGenerator } from './helpers/run-generator.mjs';
import { dockerComposeAvailable, composeConfig, undefinedVariableWarnings } from './helpers/docker.mjs';

const KEYSTORE_FILES = [
  'keystores/alfresco/ssl.keystore',
  'keystores/alfresco/ssl.truststore',
  'keystores/solr/solr.p12',
  'keystores/solr/truststore.p12',
  'keystores/trackers/trackers.p12',
  'keystores/trackers/truststore.p12'
];

async function generate(overrides) {
  const runResult = await runGenerator({ acsVersion: '26.2', searchType: 'jeci', ...overrides });
  return {
    cwd: runResult.cwd,
    compose: fs.readFileSync(path.join(runResult.cwd, 'docker-compose.yml'), 'utf8')
  };
}

describe('Jeci fork with mTLS (solrHttpMode=https)', () => {
  test('Solr serves TLS and requires a client certificate', async () => {
    const { compose } = await generate({ solrHttpMode: 'https' });

    assert.match(compose, /SOLR_SSL_ENABLED: "true"/);
    assert.match(compose, /SOLR_SSL_NEED_CLIENT_AUTH: "true"/);
    assert.match(compose, /SOLR_SSL_KEY_STORE: "\/opt\/pristy-search-services\/keystore\/solr\.p12"/);
    assert.match(compose, /ALFRESCO_SECURE_COMMS: "https"/);
    assert.doesNotMatch(compose, /alfresco\.secureComms\.secret/);
  });

  test('both tracker legs and the tracker admin server use mTLS', async () => {
    const { compose } = await generate({ solrHttpMode: 'https' });

    assert.match(compose, /ALFRESCO_TRACKER_SOLR_URL: "https:\/\/solr:8983\/solr"/);
    assert.match(compose, /ALFRESCO_TRACKER_SOLR_SECURECOMMS: "https"/);
    assert.match(compose, /ALFRESCO_TRACKER_REPOSITORY_URL: "https:\/\/alfresco:8443\/alfresco"/);
    assert.match(compose, /ALFRESCO_TRACKER_REPOSITORY_SECURECOMMS: "https"/);
    assert.match(compose, /TRACKER_SERVER_SSL_ENABLED: "true"/);
    assert.doesNotMatch(compose, /SHAREDSECRET/);
  });

  test('the Repository gets the PKCS12 stores of the fork', async () => {
    const { compose } = await generate({ solrHttpMode: 'https' });

    assert.match(compose, /KEYSTORE_TYPE: PKCS12/);
    assert.match(compose, /CERT_ALIAS: alfresco/);
    assert.match(compose, /-Dssl-keystore\.aliases=alfresco/);
    assert.match(compose, /-Dssl-truststore\.aliases=jeci-ca/);
    assert.match(compose, /-Dalfresco\.encryption\.ssl\.keystore\.type=PKCS12/);
  });

  test('every service gets the keystore it needs', async () => {
    const { cwd, compose } = await generate({ solrHttpMode: 'https' });

    for (const file of KEYSTORE_FILES) {
      assert.ok(fs.existsSync(path.join(cwd, file)), `${file} missing`);
    }
    assert.match(compose, /- \.\/keystores\/solr:\/opt\/pristy-search-services\/keystore/);
    assert.match(compose, /- \.\/keystores\/trackers:\/keystore/);
    assert.match(compose, /- \.\/keystores\/alfresco:\/usr\/local\/tomcat\/keystore/);
  });

  test('Traefik does not try to route a Solr behind mTLS', async () => {
    const { compose } = await generate({ solrHttpMode: 'https', proxyType: 'traefik' });

    assert.doesNotMatch(compose, /traefik\.http\.routers\.solr\./);
  });

  test('shared secret stays the default and emits no TLS wiring', async () => {
    const { cwd, compose } = await generate({ solrHttpMode: 'secret' });

    assert.match(compose, /ALFRESCO_SECURE_COMMS: "secret"/);
    assert.match(compose, /ALFRESCO_TRACKER_SOLR_URL: "http:\/\/solr:8983\/solr"/);
    assert.doesNotMatch(compose, /SOLR_SSL_ENABLED/);
    assert.doesNotMatch(compose, /TRACKER_SERVER_SSL_ENABLED/);
    assert.equal(fs.existsSync(path.join(cwd, 'keystores')), false);
  });

  test('plain http falls back to shared secret', async () => {
    const { compose } = await generate({ solrHttpMode: 'http' });

    assert.match(compose, /ALFRESCO_SECURE_COMMS: "secret"/);
  });

  test(
    'the mTLS project is a valid compose file',
    { skip: !dockerComposeAvailable() && 'docker compose unavailable' },
    async () => {
      const { cwd } = await generate({ solrHttpMode: 'https' });
      const { ok, stderr } = composeConfig(cwd);

      assert.ok(ok, `docker compose config failed:\n${stderr}`);
      assert.deepEqual(undefinedVariableWarnings(stderr), []);
    }
  );
});
