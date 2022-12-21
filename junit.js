var replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const counterMetrics = [ "data_received", "data_sent", "iterations", "http_reqs"];
const gaugeMetrics = ["vus", "vus_max"];
const rateMetrics = ["http_req_failed", "checks"];
const trendMetrics = ["http_req_sending", "iteration_duration", "http_req_duration", "http_req_connecting", 
                      "http_req_waiting", "http_req_blocked", "http_req_waiting", "http_req_receiving",
                      "http_req_tls_handshaking", ];

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
        if (counterMetrics.includes(metricName)) {
          failureMessage = '"><failure message="failed, count: ' + metric.values.count + '"/></testcase>';
        } 
        else if (gaugeMetrics.includes(metricName)){
          failureMessage = '"><failure message="failed, value: ' + metric.values.value + '"/></testcase>';
        }
        else if (rateMetrics.includes(metricName)) {
          failureMessage = '"><failure message="failed, number of fails: ' + metric.values.fails + '"/></testcase>';
        }
        else if (trendMetrics.includes(metricName)) {
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
