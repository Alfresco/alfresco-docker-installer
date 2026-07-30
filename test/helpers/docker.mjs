import { spawnSync } from 'node:child_process';

let cached;

/**
 * Returns true if a `docker compose` CLI is usable in this environment.
 * Result is cached for the process lifetime.
 */
export function dockerComposeAvailable() {
  if (cached !== undefined) return cached;
  // Escape hatch for CI/local runs that want to skip docker validation.
  if (process.env.ADI_SKIP_DOCKER === '1') {
    cached = false;
    return cached;
  }
  const res = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' });
  cached = res.status === 0;
  return cached;
}

/**
 * Validates a generated Docker Compose project with `docker compose config`,
 * the canonical syntactic validator: it parses the YAML, resolves ${VAR}
 * interpolation from the sibling .env, and applies the compose schema.
 *
 * A build context that does not exist on disk is fine - `config` does not
 * require it. Undefined variable interpolation surfaces as a stderr warning,
 * which callers can assert against so every ${TAG} must resolve from .env.
 *
 * @param {string} projectDir directory containing docker-compose.yml and .env
 * @returns {{ ok: boolean, stdout: string, stderr: string }}
 */
export function composeConfig(projectDir) {
  const res = spawnSync(
    'docker',
    ['compose', '--project-directory', projectDir, 'config'],
    { encoding: 'utf8' }
  );
  return {
    ok: res.status === 0,
    stdout: res.stdout || '',
    stderr: res.stderr || ''
  };
}

/**
 * Returns the list of undefined-variable interpolation warnings emitted by
 * `docker compose config` (e.g. a ${TAG} with no value in .env). Empty array
 * means every interpolated variable resolved.
 */
export function undefinedVariableWarnings(stderr) {
  return stderr
    .split('\n')
    .filter(line => /variable is not set/i.test(line))
    .map(line => line.trim());
}

/**
 * Actually builds every service with a build context in a generated project via
 * `docker compose build`. This pulls base images and runs the Dockerfiles (for
 * jeci it compiles the Solr 9 fork from source), so it is slow and network-bound
 * - reserved for the opt-in deep test, never the default suite.
 *
 * @param {string} projectDir directory containing the full generated project
 * @param {number} timeoutMs kill the build after this long
 * @returns {{ ok: boolean, stdout: string, stderr: string, timedOut: boolean }}
 */
export function composeBuild(projectDir, timeoutMs) {
  const res = spawnSync(
    'docker',
    ['compose', '--project-directory', projectDir, 'build'],
    { encoding: 'utf8', timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 }
  );
  return {
    ok: res.status === 0,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    timedOut: res.signal === 'SIGTERM' || res.error?.code === 'ETIMEDOUT'
  };
}
