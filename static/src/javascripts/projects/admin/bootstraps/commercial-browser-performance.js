/*global $*/
define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/template',
    'lodash/collections/countBy',
    'lodash/collections/find',
    'lodash/collections/map'
], function (
    config,
    fetchJson,
    template,
    countBy,
    find,
    map
) {
    var chart;
    var FETCH_INTERVAL = 1000; // The frequency that we poll for report data.
    var FETCH_DELAY = 10; // The delay which we wait before we ask for a time-based datapoint, eg. 10 seconds before the present moment.
    var reportTemplateUrl = '/commercial-reports/<%=isoDate%>';

    var commercialStartTimes = [];

    function initialise() {

       chart = $('#browser-live-performance-data').epoch({
            type: 'time.heatmap',
            buckets: 10,
            bucketRange: [0, 13000],
            axes: ['left', 'right', 'bottom'],

            data: [{
                label: 'Commercial Start Time',
                values: commercialStartTimes
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
        }).then(function (logs) {

            var appStartTimes = map(logs.reports, function(report){
                var primaryBaseline = find(report.baselines, function(baseline){
                    return baseline.name === 'primary';
                });
                return primaryBaseline ? primaryBaseline.time : 0;
            });

            var heatmapData = {
                time: currentDate.getTime() / 1000,
                histogram: countBy(appStartTimes)
            };
            chart.push([heatmapData]);
        });
    }

    return {
        init: initialise
    };
});
