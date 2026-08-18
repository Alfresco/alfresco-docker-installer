import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { runGenerator } from './helpers/run-generator.mjs';
import { ALL_ADDONS, addonsForVersion } from '../generators/app/index.js';

// Every ACS version the generator offers. Version-restricted addons carry an
// explicit allowlist, so a new release added to the prompt but not to the
// catalog silently drops those addons - the availability tests below guard that.
const ACS_VERSIONS = [
  '6.1', '6.2', '7.0', '7.1', '7.2', '7.3', '7.4',
  '23.1', '23.2', '23.3', '23.4', '25.1', '25.2', '25.3', '26.1', '26.2'
];

const LATEST = '26.2';

function availableOn(acsVersion) {
  return addonsForVersion(acsVersion).map(a => a.value);
}

describe('addon availability per ACS version', () => {
  test('OCR Transformer is offered on every ACS 7+ version', () => {
    const sevenPlus = ACS_VERSIONS.filter(v => !v.startsWith('6.'));
    for (const version of sevenPlus) {
      assert.ok(
        availableOn(version).includes('alf-tengine-ocr'),
        `alf-tengine-ocr should be available on ACS ${version}`
      );
    }
  });

  test('OCR Transformer is not offered on ACS 6.x', () => {
    for (const version of ['6.1', '6.2']) {
      assert.ok(
        !availableOn(version).includes('alf-tengine-ocr'),
        `alf-tengine-ocr should not be available on ACS ${version}`
      );
    }
  });

  test('Simple OCR is offered only on ACS 6.x', () => {
    for (const version of ACS_VERSIONS) {
      assert.equal(
        availableOn(version).includes('simple-ocr'),
        version.startsWith('6.'),
        `simple-ocr availability wrong for ACS ${version}`
      );
    }
  });

  test('every version-restricted addon lists only known ACS versions', () => {
    for (const addon of ALL_ADDONS) {
      if (!addon.acsVersions) continue;
      for (const version of addon.acsVersions) {
        assert.ok(
          ACS_VERSIONS.includes(version),
          `addon ${addon.value} lists unknown ACS version ${version}`
        );
      }
    }
  });

  test('unrestricted addons are offered on the latest ACS version', () => {
    const unrestricted = ALL_ADDONS.filter(a => !a.acsVersions).map(a => a.value);
    const available = availableOn(LATEST);
    for (const value of unrestricted) {
      assert.ok(available.includes(value), `${value} missing on ACS ${LATEST}`);
    }
  });
});

describe(`OCR Transformer wiring on ACS ${LATEST}`, () => {
  test('selecting the addon emits the transform-ocr service and repo config', async () => {
    const runResult = await runGenerator({
      acsVersion: LATEST,
      addons: ['alf-tengine-ocr']
    });
    const compose = fs.readFileSync(
      path.join(runResult.cwd, 'docker-compose.yml'),
      'utf8'
    );

    assert.match(compose, /^\s{4}transform-ocr:/m, 'transform-ocr service missing');
    assert.match(
      compose,
      /image:\s*angelborroy\/alfresco-tengine-ocr:/,
      'OCR T-Engine image missing'
    );
    assert.match(
      compose,
      /-DlocalTransform\.ocr\.url=http:\/\/transform-ocr:8090\//,
      'repository is not pointed at the OCR T-Engine'
    );

    // The embed-metadata action JAR ships alongside the T-Engine.
    assert.ok(
      fs.existsSync(
        path.join(runResult.cwd, 'alfresco/modules/jars/embed-metadata-action-1.0.0.jar')
      ),
      'embed-metadata-action JAR not copied'
    );
  });

  test('omitting the addon leaves no OCR wiring behind', async () => {
    const runResult = await runGenerator({ acsVersion: LATEST, addons: [] });
    const compose = fs.readFileSync(
      path.join(runResult.cwd, 'docker-compose.yml'),
      'utf8'
    );

    assert.doesNotMatch(compose, /^\s{4}transform-ocr:/m, 'unexpected transform-ocr service');
    assert.doesNotMatch(compose, /localTransform\.ocr\.url/, 'unexpected OCR transform config');
  });
});
