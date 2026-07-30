import helpers from 'yeoman-test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Absolute path to the generator under test.
export const GENERATOR_PATH = path.resolve(__dirname, '../../generators/app/index.js');

// Full set of prompt answers the generator can ask. Individual combinations
// override only the keys they care about; everything else keeps these defaults
// so the generator never blocks on an unanswered question.
const DEFAULT_ANSWERS = {
  acsVersion: '26.2',
  arch: false,
  ram: '16',
  https: false,
  proxyType: 'nginx',
  searchType: 'opensearch',
  serverName: 'localhost',
  password: 'admin',
  port: '80',
  configureHttpIp: false,
  httpBindingIp: '0.0.0.0',
  ftp: false,
  configureFtpIp: false,
  ftpBindingIp: '0.0.0.0',
  mariadb: false,
  crossLocale: true,
  enableContentIndexing: true,
  solrHttpMode: 'secret',
  activemq: false,
  activeMqCredentials: false,
  activeMqUser: 'admin',
  activeMqPassword: 'password',
  smtp: false,
  ldap: false,
  addons: [],
  windows: false,
  startscript: true,
  volumesscript: true
};

/**
 * Runs the real generator headless with the given answer overrides and returns
 * the yeoman-test RunResult (whose .cwd holds the generated project). This drives
 * the actual code path - prompts, applyDerivedDefaults, EJS rendering - so the
 * tests never drift from the generator's real behavior.
 */
export async function runGenerator(overrides = {}) {
  const answers = { ...DEFAULT_ANSWERS, ...overrides };
  return helpers
    .create(GENERATOR_PATH)
    .withAnswers(answers)
    .withOptions({ 'skip-install': true, skipInstallMessage: true })
    .run();
}
