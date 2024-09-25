const { humanizeValue } = require('./text.js');

const title = 'K6 Report';

const createTableHead = (columns) => `
<thead>
    <tr>
        ${columns.map((key) => `<th>${key}</th>`).join('\n')}
    </tr>
</thead>`;

const createTableBody = (metrics, columns, type) => `
<tbody>
    ${metrics
      .map((metric) => createTableRow(metric, columns, type))
      .sort((a, b) => a.localeCompare(b))
      .join('\n')}
</tbody>`;

const getRowValue = (metric, key, type) => {
  if (['time', 'data'].includes(metric.contains) && key !== type) {
    return humanizeValue(metric.values[key] ?? 0, metric);
  } else if (metric.values && !isNaN(metric.values[key])) {
    if (['counter', 'gauge'].includes(metric.type)) {
      if (key === 'rate') {
        return metric.values[key].toFixed(2);
      }

      return metric.values[key];
    } else if (metric.type === 'rate') {
      return metric.values[key];
    }
  } else if (
    typeof metric[key] === 'number' &&
    key.toLowerCase().includes('duration')
  ) {
    return humanizeValue(metric[key], { contains: 'time' });
  }

  return metric[key];
};

const createTableRow = (metric, columns, type) => `
<tr>
    ${columns
      .map((key) => `<td>${getRowValue(metric, key, type)}</td>`)
      .join('\n')}
</tr>`;

const generateTable = (name, metrics, excludeColumns = [], type = '') => {
  if (!metrics) {
    return '';
  } else if (metrics.length === 0) {
    return `<h2>${name}</h2><p class="no-data">No data available</p>`;
  }

  const columns = [
    type,
    ...Object.keys(metrics[0].values || metrics[0]),
  ].filter((c) => !excludeColumns.includes(c) && c !== '');

  return `
    <h2>${name}</h2>
    <table>
        ${createTableHead(columns)}
        ${createTableBody(metrics, columns, type)}
    </table>`;
};

const template = (
  rootGroup,
  state,
  trendMetrics,
  rateMetrics,
  counterMetrics,
  gaugeMetrics,
) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          body { font-family: sans-serif; background-color: #f6f8fa; color: #333; margin: 0; padding: 0; 
              line-height: 1.6; }
          h1, h2 { font-weight: bold; color: #2b3137; }
          h1 { text-align: center; padding: 20px; background-color: #282f36; color: white; margin: 0; }
          #container { max-width: 1000px; margin: 0 auto; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: white; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f4f8; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .no-data { color: #a0aec0; text-align: center; font-style: italic; }
      </style>
  </head>
  <body>
      <h1>${title}</h1>
      <div id="container">
          ${generateTable('Root Checks', rootGroup.checks, ['path', 'id'])}
          ${generateTable('State', [state])}
          ${generateTable('Trend Metrics', trendMetrics, [], 'metric')}
          ${generateTable('Rate Metrics', rateMetrics, [], 'metric')}
          ${generateTable('Counter Metrics', counterMetrics, [], 'metric')}
          ${generateTable('Gauge Metrics', gaugeMetrics, [], 'metric')}
      </div>
  </body>
  </html>
  `;

const orderMetricsValues = (metrics) =>
  Object.entries(metrics)
    .map(([metric, m]) => ({
      ...m,
      metric,
    }))
    .map((metric) => {
      if (metric.values) {
        metric.values = Object.entries(metric.values)
          .sort(([a], [b]) => a.localeCompare(b))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      }

      return { ...metric };
    });

const findMetricsAndSort = (metrics, type) =>
  metrics
    .filter((m) => m.type === type)
    .sort((a, b) => a.metric.localeCompare(b.metric));

const defaultOptions = { trend: true, rate: true, counter: true, gauge: true };

function generateHtmlSummary(data, options = {}) {
  const {
    trend: trendEnabled,
    rate: rateEnabled,
    counter: counterEnabled,
    gauge: gaugeEnabled,
  } = { ...defaultOptions, ...options };

  const metrics = orderMetricsValues(data.metrics);

  const trendMetrics = trendEnabled
    ? findMetricsAndSort(metrics, 'trend')
    : null;
  const rateMetrics = rateEnabled ? findMetricsAndSort(metrics, 'rate') : null;
  const counterMetrics = counterEnabled
    ? findMetricsAndSort(metrics, 'counter')
    : null;
  const gaugeMetrics = gaugeEnabled
    ? findMetricsAndSort(metrics, 'gauge')
    : null;

  return template(
    data.root_group,
    data.state,
    trendMetrics,
    rateMetrics,
    counterMetrics,
    gaugeMetrics,
  );
}

exports.htmlSummary = generateHtmlSummary;
