import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import helpers from 'yeoman-test';
import { prepareCommand } from 'yeoman-environment';

import { GENERATOR_PATH } from './helpers/run-generator.mjs';

const BOOLEAN_OPTIONS = [
  'arch',
  'https',
  'configureHttpIp',
  'ftp',
  'configureFtpIp',
  'mariadb',
  'crossLocale',
  'enableContentIndexing',
  'opensearchDashboards',
  'activemq',
  'activeMqCredentials',
  'smtp',
  'ldap',
  'windows',
  'startscript',
  'volumesscript',
  'dockerDesktop'
];

const BASE_ARGUMENTS = [
  '--acsVersion=26.1',
  '--arch=false',
  '--ram=16',
  '--https=false',
  '--proxyType=nginx',
  '--serverName=localhost',
  '--password=admin',
  '--port=80',
  '--configureHttpIp=false',
  '--httpBindingIp=127.0.0.1',
  '--ftp=false',
  '--configureFtpIp=false',
  '--ftpBindingIp=127.0.0.1',
  '--mariadb=false',
  '--crossLocale=true',
  '--enableContentIndexing=true',
  '--searchType=alfresco',
  '--opensearchDashboards=false',
  '--solrHttpMode=secret',
  '--activemq=false',
  '--activeMqCredentials=false',
  '--activeMqUser=admin',
  '--activeMqPassword=password',
  '--smtp=false',
  '--ldap=false',
  '--addons=',
  '--windows=false',
  '--startscript=false',
  '--volumesscript=false',
  '--dockerDesktop=false'
];

function replaceArgument(arguments_, name, value) {
  return arguments_.map(argument =>
    argument.startsWith(`--${name}=`) ? `--${name}=${value}` : argument
  );
}

async function parseCommandOptions(arguments_) {
  const command = await prepareCommand({
    resolved: GENERATOR_PATH,
    namespace: 'alfresco-docker-installer:app'
  });
  command.exitOverride();
  command.action(() => {});
  command.parse(arguments_, { from: 'user' });
  return command.opts();
}

function runWithArguments(arguments_) {
  return helpers
    .create(GENERATOR_PATH)
    .withArguments(arguments_)
    .withAnswers({}, { throwOnMissingAnswer: true })
    .withOptions({ 'skip-install': true, skipInstallMessage: true })
    .run();
}

describe('boolean command-line options', () => {
  test('the Yeoman command parser preserves explicit boolean values', async () => {
    const falseOptions = await parseCommandOptions(
      BOOLEAN_OPTIONS.map(name => `--${name}=false`)
    );
    const trueOptions = await parseCommandOptions(
      BOOLEAN_OPTIONS.map(name => `--${name}=true`)
    );

    for (const name of BOOLEAN_OPTIONS) {
      assert.equal(falseOptions[name], 'false', `--${name}=false was not preserved`);
      assert.equal(trueOptions[name], 'true', `--${name}=true was not preserved`);
    }
  });

  test('bare boolean options remain shorthand for true', async () => {
    const options = await parseCommandOptions(BOOLEAN_OPTIONS.map(name => `--${name}`));

    for (const name of BOOLEAN_OPTIONS) {
      assert.equal(options[name], true, `--${name} was not parsed as true`);
    }
  });

  test('explicit false values generate PostgreSQL without LDAP or dependent prompts', async () => {
    const runResult = await runWithArguments(BASE_ARGUMENTS);
    const compose = fs.readFileSync(path.join(runResult.cwd, 'docker-compose.yml'), 'utf8');

    assert.match(compose, /^\s{4}postgres:/m);
    assert.doesNotMatch(compose, /^\s{4}mariadb:/m);
    assert.doesNotMatch(compose, /^\s{4}openldap:/m);
    assert.doesNotMatch(compose, /^\s{4}phpldapadmin:/m);
    assert.doesNotMatch(compose, /-Dldap\.authentication\.active=true/);
    assert.equal(fs.existsSync(path.join(runResult.cwd, 'start.sh')), false);
  });

  test('explicit true values generate MariaDB and LDAP services', async () => {
    let arguments_ = replaceArgument(BASE_ARGUMENTS, 'mariadb', 'true');
    arguments_ = replaceArgument(arguments_, 'ldap', 'true');

    const runResult = await runWithArguments(arguments_);
    const compose = fs.readFileSync(path.join(runResult.cwd, 'docker-compose.yml'), 'utf8');

    assert.match(compose, /^\s{4}mariadb:/m);
    assert.doesNotMatch(compose, /^\s{4}postgres:/m);
    assert.match(compose, /^\s{4}openldap:/m);
    assert.match(compose, /^\s{4}phpldapadmin:/m);
    assert.match(compose, /-Dldap\.authentication\.active=true/);
  });

  test('invalid boolean values fail with the option name', async () => {
    const arguments_ = replaceArgument(BASE_ARGUMENTS, 'ldap', 'sometimes');

    await assert.rejects(
      runWithArguments(arguments_),
      /Option --ldap must be true or false\./
    );
  });
});
