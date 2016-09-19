/*global $, Epoch, d3*/
define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/template',
    'lodash/collections/countBy',
    'lodash/collections/find',
    'lodash/collections/map',
    'lodash/collections/reduce',
    'lodash/collections/filter',
    'lodash/arrays/flatten'
], function (
    config,
    fetchJson,
    template,
    countBy,
    find,
    map,
    reduce,
    filter,
    flatten
) {
    var chart;
    var FETCH_INTERVAL = 1000; // The frequency that we poll for report data.
    var FETCH_DELAY = 10; // The delay which we wait before we ask for a time-based datapoint, eg. 10 seconds before the present moment.
    var reportTemplateUrl = '/commercial-reports/<%=isoDate%>';
    var colors = d3.scale.category10().range();
    var advertLoadTimes = {      // Store the 5000 most recently fetched datapoints.
        prebid: [],
        waterfall: [],
        sonobi: []
    };

    function initialise() {

       chart = $('#programmatic-live-performance-data').epoch({
            type: 'time.line',
            range: [0, 4000],
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

       window.setInterval(renderCurrentData, FETCH_INTERVAL);

       // Backfill the data to get accurate averages.
       var backFillDate = new Date();
       backFillDate.setSeconds(backFillDate.getSeconds() - FETCH_DELAY);

       // Get the last 2 minutes worth of data.
       for (var i = 0; i < 120; i++) {
           backFillDate.setMilliseconds(backFillDate.getMilliseconds() - FETCH_INTERVAL);
           fetchData(backFillDate, false);
       }
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

    function storeAdvertLoadTimes(loadTimes, deliveryMethod) {
        // Find the corresponding array to store these start times.
        var globalTimeValues = advertLoadTimes[deliveryMethod];

        // Push the new start times into the stored array to find an average.
        Array.prototype.push.apply(globalTimeValues, loadTimes);
        // Limit the size of the array to 5000.
        if (globalTimeValues.length > 5000) {
            globalTimeValues.splice(0, globalTimeValues.length - 5000);
        }

        if (!globalTimeValues.length) {
            return;
        }

        $('.average--' + deliveryMethod).text(calculateAverage(globalTimeValues));
    }

    // Searches through the report data to find advert loading times. It then stores the load time values, and returns
    // the average load time for this batch of reports.
    function processAdvertLoadTimes(reports, deliveryMethod) {
        var loadData = map(reports, function(report){
            var recordedAdverts = filter(report.adverts, function(advert) {
                return advert.stopLoading && advert.startLoading;
            });

            return map(recordedAdverts, function(report) {
                return report.stopLoading - report.startLoading;
            });
        });
        var loadTimes = flatten(loadData);

        // Filter the times array from silly numbers.
        var validLoadTimes = filter(loadTimes, function(executionTime) { return executionTime < 30000; });

        // Store the execution times too, to display global dataset averages.
        storeAdvertLoadTimes(validLoadTimes, deliveryMethod);

        // Return the average for this specific timestamped dataset.
        return calculateAverage(validLoadTimes);
    }

    function renderCurrentData() {
        var currentDate = new Date();
        currentDate.setSeconds(currentDate.getSeconds() - FETCH_DELAY);
        fetchData(currentDate, true);
    }

    function fetchData(date, renderGraphData) {

        var fetchUrl = template(reportTemplateUrl, {
            isoDate: date.toISOString()
        });

        fetchJson(config.page.beaconUrl + fetchUrl, {
            mode: 'cors'
        }).then(function (logs) {

            var prebidReports = getProgrammaticReports(logs.reports, 'prebid');
            var waterfallReports = getProgrammaticReports(logs.reports, 'waterfall');
            var sonobiReports = getProgrammaticReports(logs.reports, 'sonobi');
            
            var prebidAdvertLoadTime = processAdvertLoadTimes(prebidReports, 'prebid');
            var waterfallAdvertLoadTime = processAdvertLoadTimes(waterfallReports, 'waterfall');
            var sonobiAdvertLoadTime = processAdvertLoadTimes(sonobiReports, 'sonobi');

            if (renderGraphData) {
                var time = date.getTime() / 1000;

                chart.push([
                    {
                        time: time,
                        y: prebidAdvertLoadTime
                    },
                    {
                        time: time,
                        y: waterfallAdvertLoadTime
                    },
                    {
                        time: time,
                        y: sonobiAdvertLoadTime
                    }
                ]);
            }
        });
    }

    return {
        init: initialise
    };
});
