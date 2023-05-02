const replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (char) => replacements[char]);
}

function generateJUnitXML(data, options) {
  let failures = 0;
  let cases = [];

  Object.entries(data.metrics).forEach(([metricName, metric]) => {
    if (!metric.thresholds) {
      return;
    }
    Object.entries(metric.thresholds).forEach(([thresholdName, threshold]) => {
      if (threshold.ok) {
        cases.push(
          `<testcase name="${escapeHTML(metricName)} - ${escapeHTML(
            thresholdName,
          )}" />`,
        );
      } else {
        failures++;
        const failureMessage =
          `"><failure message="${metric.type} threshold failed: ` +
          Object.entries(metric.values)
            .map(([key, value]) => `${key} value: ${value}`)
            .join(', ') +
          '"/></testcase>';

        cases.push(
          `<testcase name="${escapeHTML(metricName)} - ${escapeHTML(
            thresholdName,
          )}${failureMessage}"`,
        );
      }
    });
  });

  const name =
    options && options.name ? escapeHTML(options.name) : 'k6 thresholds';

  return `<?xml version="1.0"?>
    <testsuites tests="${cases.length}" failures="${failures}">
      <testsuite name="${name}" tests="${cases.length}" failures="${failures}">
        ${cases.join('\n')}
      </testsuite>
    </testsuites>`;
}

exports.jUnit = generateJUnitXML;
