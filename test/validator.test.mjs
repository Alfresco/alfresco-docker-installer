import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  dockerComposeAvailable,
  composeConfig,
  undefinedVariableWarnings
} from './helpers/docker.mjs';

// Self-tests for the syntactic validator itself: if `docker compose config`
// were a no-op (always "ok"), the combination suite would pass vacuously.
// These negative/positive controls prove the validator actually discriminates.
describe('docker compose config validator (self-test)', { skip: !dockerComposeAvailable() && 'docker compose unavailable' }, () => {
  function tmpProject(compose, env) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adi-validator-'));
    fs.writeFileSync(path.join(dir, 'docker-compose.yml'), compose);
    fs.writeFileSync(path.join(dir, '.env'), env);
    return dir;
  }

  test('accepts a well-formed project with all vars resolved', () => {
    const dir = tmpProject(
      'services:\n  a:\n    image: nginx:${GOOD_TAG}\n',
      'GOOD_TAG=stable-alpine\n'
    );
    try {
      const { ok, stderr } = composeConfig(dir);
      assert.ok(ok, `expected valid project to pass:\n${stderr}`);
      assert.equal(undefinedVariableWarnings(stderr).length, 0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('rejects malformed YAML', () => {
    // Unterminated quoted scalar -> parser error.
    const dir = tmpProject(
      'services:\n  a:\n    image: nginx\n    ports:\n      - "80:80\n',
      ''
    );
    try {
      const { ok } = composeConfig(dir);
      assert.equal(ok, false, 'expected malformed YAML to be rejected');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('flags an unresolved ${VAR} interpolation', () => {
    const dir = tmpProject(
      'services:\n  a:\n    image: nginx:${UNDEFINED_TAG}\n',
      'SOMETHING_ELSE=x\n'
    );
    try {
      const { stderr } = composeConfig(dir);
      const warnings = undefinedVariableWarnings(stderr);
      assert.ok(
        warnings.some(w => w.includes('UNDEFINED_TAG')),
        `expected an unresolved-variable warning, got:\n${stderr}`
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
