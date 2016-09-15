/*global $, Epoch*/
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
    }

    function getProgrammaticReports(reports, deliveryMethod) {
        return filter(reports, function(report) { return report.tags.indexOf(deliveryMethod) !== -1; });
    }

    function getAverageStartTime(reports) {
        var startTimes = map(reports, function(report){
            var primaryBaseline = find(report.baselines, function(baseline){
                return baseline.name === 'primary';
            });
            return primaryBaseline ? primaryBaseline.time : 0;
        });

        // Filter the times array from silly numbers.
        var validStartTimes = filter(startTimes, function(startTime) { return startTime < 20000; });

        var sum = reduce(validStartTimes, function(sum, num) { return sum + num; });
        var average = (sum / validStartTimes.length);
        return Number.isFinite(average) ? average.toFixed([2]) : 0;
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
            
            var prebidStartTime = getAverageStartTime(prebidReports);
            var waterfallStartTime = getAverageStartTime(waterfallReports);
            var sonobiStartTime = getAverageStartTime(sonobiReports);

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
