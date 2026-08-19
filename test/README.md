# Tests

The generator is driven headless with [`yeoman-test`](https://github.com/yeoman/yeoman-test),
so every test exercises the real code path (prompts, `applyDerivedDefaults`, EJS
rendering, file emission) and never drifts from the generator's behavior.

## Layout

- `helpers/run-generator.mjs` - runs the generator with answer overrides, returns the generated project.
- `helpers/combinations.mjs` - enumerates the valid deployment combinations for ACS 26.1 and 26.2.
- `helpers/docker.mjs` - thin wrappers over `docker compose config` (syntactic validation) and `docker compose build` (deep build).
- `combinations.test.mjs` - generates all combinations and validates the produced Docker assets.
- `addons.test.mjs` - addon availability per ACS version, plus OCR Transformer wiring on the latest version.
- `opensearch-dashboards.test.mjs` - OpenSearch Dashboards gating (ACS 26.2 + opensearch backend only) and its wiring.
- `validator.test.mjs` - self-tests proving the `docker compose config` validator actually discriminates.
- `build.test.mjs` - opt-in: builds real images for one representative combination per search backend.

## Running

Default suite (generation + structural checks + `docker compose config` syntactic validation):

```bash
npm test
```

This covers 128 combinations (64 for 26.1, 64 for 26.2), 7 addon tests, 5 OpenSearch Dashboards tests and 3 validator self-tests.
If `docker compose` is not available it still runs generation and structural
assertions; the syntactic validation is skipped with a warning.

### Environment flags

- `ADI_SKIP_DOCKER=1` - skip all `docker compose` validation even when docker is present (generation + structural checks only).
- `ADI_DEEP_BUILD=1` - enable the opt-in deep build test (`build.test.mjs`).
- `ADI_BUILD_TIMEOUT_MS` - per-build timeout for the deep test (default 20 minutes).

### Deep build (opt-in, slow)

Actually builds the generated images. For `jeci` this compiles the Solr 9
community fork from source, so it pulls base images and can take several minutes:

```bash
ADI_DEEP_BUILD=1 npm test
```
