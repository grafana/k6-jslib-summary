var replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const counterType = "counter";
const gaugeType = "gauge";
const rateType = "rate";
const trendType = "trend";

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
        var failureMessage = ""
        if (metric.type == counterType) {
          failureMessage = '"><failure message="failed, count: ' + metric.values.count + '"/></testcase>';
        } 
        else if (metric.type == gaugeType){
          failureMessage = '"><failure message="failed, value: ' + metric.values.value + '"/></testcase>';
        }
        else if (metric.type == rateType) {
          failureMessage = '"><failure message="failed, number of fails: ' + metric.values.fails + '"/></testcase>';
        }
        else if (metric.type == trendType) {
          failureMessage = '"><failure message="failed, number of fails: ' + metric.values.fails + '"/></testcase>';
        }
        else {
          // Default failure message for new metric types that will be included in the future.
          failureMessage = '"><failure message="failed" /></testcase>';
        }
        cases.push(
          '<testcase name="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) + failureMessage
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
