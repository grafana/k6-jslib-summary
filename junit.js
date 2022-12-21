var replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const counter = "counter";
const gauge = "gauge";
const rate = "rate";
const trend = "trend";

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
        if (metric.type == counter) {
          failureMessage = '"><failure message="failed, count: ' + metric.values.count + '"/></testcase>';
        } 
        else if (metric.type == gauge){
          failureMessage = '"><failure message="failed, value: ' + metric.values.value + '"/></testcase>';
        }
        else if (metric.type == rate) {
          failureMessage = '"><failure message="failed, number of fails: ' + metric.values.fails + '"/></testcase>';
        }
        else if (metric.type == trend) {
          failureMessage = '"><failure message="failed, number of fails: ' + metric.values.fails + '"/></testcase>';
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
