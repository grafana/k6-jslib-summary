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
  const name =
    options && options.name ? escapeHTML(options.name) : 'k6 thresholds';
  const classname =
    options && options.classname ? escapeHTML(options.classname) : 'undefined';
  let failures = 0;
  let cases = [];

  Object.entries(data.metrics).forEach(([metricName, metric]) => {
    if (!metric.thresholds) {
      return;
    }
    Object.entries(metric.thresholds).forEach(([thresholdName, threshold]) => {
      const testcaseName = `${escapeHTML(metricName)} - ${escapeHTML(
        thresholdName,
      )}`;

      if (threshold.ok) {
        cases.push(
          `<testcase name="${testcaseName}" classname="${classname}" />`,
        );
      } else {
        failures++;
        const failureMessage =
          `${metric.type} threshold failed: ` +
          Object.entries(metric.values)
            .map(([key, value]) => `${key} value: ${value}`)
            .join(', ');

        cases.push(
          `<testcase name="${testcaseName}" classname="${classname}"><failure message="${escapeHTML(
            failureMessage,
          )}" /></testcase>`,
        );
      }
    });
  });

  return `<?xml version="1.0"?>
    <testsuites tests="${cases.length}" failures="${failures}">
      <testsuite name="${name}" tests="${cases.length}" failures="${failures}">
        ${cases.join('\n')}
      </testsuite>
    </testsuites>`;
}

exports.jUnit = generateJUnitXML;
