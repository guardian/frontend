/*global $*/
define([
    'common/utils/config',
    'common/utils/fetch-json',
    'lodash/collections/find',
    'lodash/collections/map'
], function (
    config,
    fetchJson,
    find,
    map
) {
    var chart = undefined;
    var FETCH_INTERVAL = 2000;

    var commercialStartTimes = [];

    function initialise() {

       chart = $('#browser-live-performance-data').epoch({ type: 'time.line', data: [{
            label: 'Commercial Start Time',
            values: commercialStartTimes
          }]
       });

       window.setInterval(fetchData, FETCH_INTERVAL);
    }

    function fetchData() {
        fetchJson(config.page.beaconUrl + '/commercial-reports/05082016-15:24:45', {
            mode: 'cors'
        }).then(function (logs) {
            var appStartTimes = map(logs.reports, function(report){
                var primaryBaseline = find(report.baselines, function(baseline){
                    return baseline.name === 'primary';
                })
                return primaryBaseline ? primaryBaseline.time : 0;
            });

            //TODO push the app start times in.
            // format : {time: 1370044800, y: 100}
            /*chart.push([{
                time: timestamp,
                y:
            }]);*/
        });
    }

    return {
        init: initialise
    };
});
