# k6-jslib-summary

This repository contains source code of the functions that can be used to generate different end-of-test summary reports when used in the `handleSummary()` callback: [https://k6.io/docs/results-visualization/end-of-test-summary](https://k6.io/docs/results-visualization/end-of-test-summary/).

## Release

Release happens automatically with the tag push to the `main` branch. The tag should be in the format of `vX.Y.Z`.

The produced artifacts are build published as artifact and will be hosted in the [https://jslib.k6.io](https://jslib.k6.io/).

To add a new version to the https://jslib.k6.io/ please follow instructions from the https://github.com/grafana/jslib.k6.io.

## Contributing

### Building

To make a local build please use `yarn build` command.

### Linting

To run a linter please execute the following command:

```bash
yarn lint
```
