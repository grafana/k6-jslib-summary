// Smoke test that the published module loads and runs on k6's runtime.
// Run with: k6 run test/smoke.test.js
import { jUnit, textSummary, humanizeValue } from '../src/index.js';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  if (typeof jUnit !== 'function') {
    throw new Error('jUnit is not exported as a function');
  }
  if (typeof textSummary !== 'function') {
    throw new Error('textSummary is not exported as a function');
  }
  if (typeof humanizeValue !== 'function') {
    throw new Error('humanizeValue is not exported as a function');
  }
}

const sampleData = {
  root_group: {
    name: '',
    checks: [{ name: 'status is 200', passes: 1, fails: 0 }],
    groups: [],
  },
  metrics: {
    http_req_duration: {
      type: 'trend',
      contains: 'time',
      values: { avg: 1.5, min: 1, med: 1.4, max: 2, 'p(90)': 1.9, 'p(95)': 2 },
      thresholds: { 'p(95)<500': { ok: true } },
    },
    checks: {
      type: 'rate',
      contains: 'default',
      values: { rate: 1, passes: 1, fails: 0 },
    },
  },
  options: {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'],
    summaryTimeUnit: '',
  },
};

export function handleSummary(data) {
  // Exercise the real entry points against representative data.
  const text = textSummary(sampleData, { enableColors: false });
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('textSummary produced no output');
  }

  const xml = jUnit(sampleData);
  if (xml.indexOf('<testsuites') === -1) {
    throw new Error('jUnit produced unexpected output');
  }

  if (humanizeValue(2048, { contains: 'data' }, '') !== '2.0 kB') {
    throw new Error('humanizeValue returned unexpected result');
  }

  return { stdout: 'smoke test ok\n' };
}
