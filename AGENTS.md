# k6-jslib-summary

Generates end-of-test summary reports for k6. Used inside k6's `handleSummary()` callback to produce colored terminal text and JUnit XML.

## Architecture

Three source files under src/ re-export two formatters and a value humanizer. esbuild bundles them into a single CJS file for jslib.k6.io distribution.

The text formatter receives k6's summary data object (groups, checks, metrics with thresholds/values) and renders column-aligned, ANSI-colored terminal output. It walks the group tree recursively for checks, then iterates all metrics. Trend-type metrics get per-stat columns; non-trend metrics get value + extras. Column widths are computed in a first pass, then applied in a second. Sub-metrics (those containing `{`) are kept adjacent to their parent via a custom sort.

The JUnit formatter iterates only thresholds (not all metrics) and emits XML testcases. Metrics without thresholds are silently skipped.

Options merge three layers: hardcoded defaults < k6 data.options < caller-supplied options. The caller layer wins.

## Gotchas

- `strWidth` uses NFKC Unicode normalization to compute display width. Changing the normalization form will break column alignment for all users. This was intentionally changed from Go's NFKD.
- The text formatter treats metric type solely by checking `metric.type == 'trend'` vs everything else. If k6 introduces a new metric type, it falls through to a `[no data]` display with no warning.
- `humanizeValue` is exported standalone because k6 Cloud and other tools reuse it outside `handleSummary`. Changing its signature or output format is a cross-repo breaking change.
- JUnit output only covers thresholds. Checks and non-threshold metrics are invisible in JUnit. If a test has no thresholds, JUnit output will be an empty testsuite.
- Build output goes to `build/` which is gitignored. Never commit it.
