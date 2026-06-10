# k6-jslib-summary

This repository contains source code of the functions that can be used to generate different end-of-test summary reports when used in the `handleSummary()` callback: [https://k6.io/docs/results-visualization/end-of-test-summary](https://k6.io/docs/results-visualization/end-of-test-summary/).

The library is a self-contained ES module that runs directly on k6's runtime; no build or transpilation step is required.

## Usage

```js
import { textSummary, jUnit } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { enableColors: true }),
    'junit.xml': jUnit(data),
  };
}
```

## Release

Release happens automatically with the tag push to the `main` branch. The tag should be in the format of `vX.Y.Z`.

The module (`src/index.js`) is published as a release artifact and hosted on [https://jslib.k6.io](https://jslib.k6.io/).

To add a new version to the https://jslib.k6.io/ please follow instructions from the https://github.com/grafana/jslib.k6.io.

## Contributing

The source lives in `src/index.js` and can be edited and run with k6 as-is.

### Testing

A smoke test verifies the module loads and the exported functions work on k6's runtime:

```bash
k6 run test/smoke.test.js
```
