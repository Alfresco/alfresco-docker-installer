// Enumerates the deployment combinations exercised by the test suite for the
// two versions that expose the proxy/search selectors: ACS 26.1 and 26.2.
//
// Only combinations the generator actually accepts are produced:
//   - 26.1 search backends: alfresco (stock Solr 6), jeci (Solr 9 fork)
//   - 26.2 search backends: opensearch (default), jeci
//   - proxy: nginx or traefik (both versions)
//   - opensearch is incompatible with MariaDB (generator throws), so that
//     pairing is skipped on purpose.
//
// The axes below are deliberately a curated cross-section rather than a full
// cartesian explosion of every prompt: each axis value is guaranteed to appear
// in several combinations, which is enough to shake out template/syntax errors
// without producing hundreds of near-identical projects.

const VERSION_SEARCH = {
  '26.1': ['alfresco', 'jeci'],
  '26.2': ['opensearch', 'jeci']
};

const PROXIES = ['nginx', 'traefik'];
const HTTPS = [false, true];
const DATABASES = ['postgres', 'mariadb'];
const ACTIVEMQ = [false, true];
const WINDOWS = [false, true];

function label(o) {
  return [
    `acs${o.acsVersion}`,
    o.searchType,
    o.proxyType,
    o.https ? 'https' : 'http',
    o.mariadb ? 'mariadb' : 'postgres',
    o.activemq ? 'amq' : 'noamq',
    o.windows ? 'winvol' : 'bindvol'
  ].join('-');
}

export function buildCombinations() {
  const combos = [];
  for (const [acsVersion, searchTypes] of Object.entries(VERSION_SEARCH)) {
    for (const searchType of searchTypes) {
      for (const proxyType of PROXIES) {
        for (const https of HTTPS) {
          for (const mariadb of DATABASES.map(d => d === 'mariadb')) {
            for (const activemq of ACTIVEMQ) {
              for (const windows of WINDOWS) {
                // OpenSearch backend requires PostgreSQL - the generator
                // rejects it with MariaDB, so don't emit that pairing.
                if (searchType === 'opensearch' && mariadb) continue;

                const overrides = {
                  acsVersion,
                  searchType,
                  proxyType,
                  https,
                  port: https ? '443' : '80',
                  mariadb,
                  activemq,
                  windows,
                  // ACS 26.1+ ActiveMQ broker requires credentials.
                  activeMqCredentials: activemq
                };
                combos.push({ label: label(overrides), overrides });
              }
            }
          }
        }
      }
    }
  }
  return combos;
}
