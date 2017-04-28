/*global $, Epoch*/
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import template from 'lodash/utilities/template';
import countBy from 'lodash/collections/countBy';
import find from 'lodash/collections/find';
import map from 'lodash/collections/map';
import reduce from 'lodash/collections/reduce';
import filter from 'lodash/collections/filter';
var chart;
var FETCH_INTERVAL = 1000; // The frequency that we poll for report data.
var FETCH_DELAY = 10; // The delay which we wait before we ask for a time-based datapoint, eg. 10 seconds before the present moment.
var reportTemplateUrl = '/commercial-reports/<%=isoDate%>';

// Store the 1000 most recently fetched datapoints.
var commercialStartTimes = [];

function initialise() {

    chart = $('#browser-live-performance-data').epoch({
        type: 'time.heatmap',
        buckets: 20,
        bucketRange: [0, 10000],
        axes: ['left', 'right', 'bottom'],
        tickFormats: {
            left: Epoch.Formats.regular,
            right: Epoch.Formats.regular
        },
        data: [{
            label: 'Commercial Start Time',
            values: []
        }]
    });

    window.setInterval(fetchData, FETCH_INTERVAL);
}

function fetchData() {
    var currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() - FETCH_DELAY);
    var fetchUrl = template(reportTemplateUrl, {
        isoDate: currentDate.toISOString()
    });

    fetchJson(config.page.beaconUrl + fetchUrl, {
        mode: 'cors'
    }).then(function(logs) {

        var appStartTimes = map(logs.reports, function(report) {
            var primaryBaseline = find(report.baselines, function(baseline) {
                return baseline.name === 'primary';
            });
            return primaryBaseline ? primaryBaseline.startTime : 0;
        });

        // Filter the times array from silly numbers, investigating why Date times are appearing in the array.
        appStartTimes = filter(appStartTimes, function(startTime) {
            return startTime < 20000;
        });

        updateAverageStartTime(appStartTimes);

        var heatmapData = {
            time: currentDate.getTime() / 1000,
            histogram: countBy(appStartTimes)
        };
        chart.push([heatmapData]);
    });
}

function updateAverageStartTime(startTimes) {
    // Push the new start times into the stored array to find an average.
    Array.prototype.push.apply(commercialStartTimes, startTimes);
    // Limit the size of the array to 1000.
    if (commercialStartTimes.length > 1000) {
        commercialStartTimes.splice(0, commercialStartTimes.length - 1000);
    }

    if (!commercialStartTimes.length) {
        return;
    }

    var sum = reduce(commercialStartTimes, function(sum, num) {
        // Disregard silly numbers, investigating why Date times are appearing in the array.
        if (num < 20000) {
            return sum + num;
        } else {
            return sum;
        }
    });

    var averageStartTime = (sum / commercialStartTimes.length).toFixed([2]);

    $('.graph__average-value').text(averageStartTime);
}

export default {
    init: initialise
};
