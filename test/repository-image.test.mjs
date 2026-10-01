import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { runGenerator } from './helpers/run-generator.mjs';

// The Repository image installs addons as root, then has to drop back to the
// unprivileged user the base image ships. The version test guarding that used to
// be a raw string comparison, which made '26.2' > '6.1' false and left every
// 23.x/25.x/26.x Repository container running as root.
async function repositoryDockerfile(acsVersion) {
  const runResult = await runGenerator({
    acsVersion,
    searchType: acsVersion === '26.2' ? 'jeci' : 'alfresco'
  });
  return fs.readFileSync(path.join(runResult.cwd, 'alfresco/Dockerfile'), 'utf8');
}

describe('Repository image user', () => {
  test('drops back to the unprivileged user on every version above 6.1', async () => {
    for (const version of ['6.2', '7.0', '7.4', '23.1', '25.3', '26.1', '26.2']) {
      const dockerfile = await repositoryDockerfile(version);
      assert.match(
        dockerfile,
        /^USER \$\{IMAGEUSERNAME\}$/m,
        `ACS ${version} Repository image would run as root`
      );
      assert.match(dockerfile, /chown -R \$\{IMAGEUSERNAME\}/);
    }
  });

  test('stays as root on ACS 6.1, whose base image has no such user', async () => {
    const dockerfile = await repositoryDockerfile('6.1');

    assert.doesNotMatch(dockerfile, /^USER \$\{IMAGEUSERNAME\}$/m);
  });
});
