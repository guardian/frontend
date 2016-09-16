/*global $, Epoch, d3*/
define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/template',
    'lodash/collections/countBy',
    'lodash/collections/find',
    'lodash/collections/map',
    'lodash/collections/reduce',
    'lodash/collections/filter'
], function (
    config,
    fetchJson,
    template,
    countBy,
    find,
    map,
    reduce,
    filter
) {
    var chart;
    var FETCH_INTERVAL = 1000; // The frequency that we poll for report data.
    var FETCH_DELAY = 10; // The delay which we wait before we ask for a time-based datapoint, eg. 10 seconds before the present moment.
    var reportTemplateUrl = '/commercial-reports/<%=isoDate%>';
    var colors = d3.scale.category10().range();
    var programmaticExecutionTimes = {      // Store the 1000 most recently fetched datapoints.
        prebid: [],
        waterfall: [],
        sonobi: []
    };

    function initialise() {

       chart = $('#programmatic-live-performance-data').epoch({
            type: 'time.line',
            range: [0, 10000],
            axes: ['left', 'right', 'bottom'],
            tickFormats: {
                left: Epoch.Formats.regular,
                right: Epoch.Formats.regular
            },
            data: [
            {
                label: 'Prebid',
                values: []
            },
            {
                label: 'Waterfall',
                values: []
            },
            {
                label: 'Sonobi',
                values: []
            }
            ]
        });

       window.setInterval(fetchData, FETCH_INTERVAL);

       // Add key colours to the legend rows, based on d3.
       $('.legend__label--prebid').css('color', colors[0]);
       $('.legend__label--waterfall').css('color', colors[1]);
       $('.legend__label--sonobi').css('color', colors[2]);
    }

    function getProgrammaticReports(reports, deliveryMethod) {
        return filter(reports, function(report) { return report.tags.indexOf(deliveryMethod) !== -1; });
    }

    // Returns a number formatted as a string giving the average of the dataset.
    function calculateAverage(dataset) {
        var sum = reduce(dataset, function(sum, num) { return sum + num; });
        var average = (sum / dataset.length);
        return Number.isFinite(average) ? average.toFixed([2]) : '0.0';
    }

    function storeAverageStartTime(startTimes, deliveryMethod) {
        // Find the corresponding array to store these start times.
        var globalTimeValues = programmaticExecutionTimes[deliveryMethod];

        // Push the new start times into the stored array to find an average.
        Array.prototype.push.apply(globalTimeValues, startTimes);
        // Limit the size of the array to 1000.
        if (globalTimeValues.length > 1000) {
            globalTimeValues.splice(0, globalTimeValues.length - 1000);
        }

        if (!globalTimeValues.length) {
            return;
        }

        $('.average--' + deliveryMethod).text(calculateAverage(globalTimeValues));
    }

    // Stores the start time values, and returns the average start time for this batch of reports.
    function processAverageStartTime(reports, deliveryMethod) {
        var startTimes = map(reports, function(report){
            var primaryBaseline = find(report.baselines, function(baseline){
                return baseline.name === 'primary';
            });
            return primaryBaseline ? primaryBaseline.startTime : 0;
        });

        // Filter the times array from silly numbers.
        var validStartTimes = filter(startTimes, function(startTime) { return startTime < 20000; });

        // Store the start times too, to display global dataset averages.
        storeAverageStartTime(validStartTimes, deliveryMethod);

        // Return the average for this specific timestamped dataset.
        return calculateAverage(validStartTimes);
    }

    function fetchData() {
        var currentDate = new Date();
        currentDate.setSeconds(currentDate.getSeconds() - FETCH_DELAY);
        var fetchUrl = template(reportTemplateUrl, {
            isoDate: currentDate.toISOString()
        });

        fetchJson(config.page.beaconUrl + fetchUrl, {
            mode: 'cors'
        }).then(function (logs) {

            var prebidReports = getProgrammaticReports(logs.reports, 'prebid');
            var waterfallReports = getProgrammaticReports(logs.reports, 'waterfall');
            var sonobiReports = getProgrammaticReports(logs.reports, 'sonobi');
            
            var prebidStartTime = processAverageStartTime(prebidReports, 'prebid');
            var waterfallStartTime = processAverageStartTime(waterfallReports, 'waterfall');
            var sonobiStartTime = processAverageStartTime(sonobiReports, 'sonobi');

            chart.push([
                {
                    time: currentDate.getTime() / 1000,
                    y: prebidStartTime
                },
                {
                    time: currentDate.getTime() / 1000,
                    y: waterfallStartTime
                },
                {
                    time: currentDate.getTime() / 1000,
                    y: sonobiStartTime
                }
            ]);
        });
    }

    return {
        init: initialise
    };
});
