var replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

function escapeHTML(str) {
  // TODO: something more robust?
  return str.replace(/[&<>'"]/g, function (char) {
    return replacements[char];
  });
}

function generateJUnitXML(data, options) {
  var failures = 0;
  var cases = [];

  forEach(data.metrics, function (metricName, metric) {
    if (!metric.thresholds) {
      return;
    }
    forEach(metric.thresholds, function (thresholdName, threshold) {
      if (threshold.ok) {
        cases.push(
          '<testcase name="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) +
            '" />',
        );
      } else {
        failures++;
        cases.push(
          '<testcase name="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) +
            '"><failure message="failed" /></testcase>',
        );
      }
    });
  });

  var name =
    options && options.name ? escapeHTML(options.name) : 'k6 thresholds';

  return (
    '<?xml version="1.0"?>\n<testsuites tests="' +
    cases.length +
    '" failures="' +
    failures +
    '">\n' +
    '<testsuite name="' +
    name +
    '" tests="' +
    cases.length +
    '" failures="' +
    failures +
    '">' +
    cases.join('\n') +
    '\n</testsuite >\n</testsuites >'
  );
}

exports.jUnit = generateJUnitXML;
