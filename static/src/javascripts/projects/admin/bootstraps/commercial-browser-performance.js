/*global $*/
define([

], function (

) {
    var chart;
    var FETCH_INTERVAL = 5000;

    var commercialStartTimes = [ {time: 1370044800, y: 100}, {time: 1370044801, y: 1000}, {time: 1370044802, y: 900}  ];

    function initialise() {

       chart = $('#browser-live-performance-data').epoch({ type: 'time.line', data: [{
            label: "Commercial Start Time",
            values: commercialStartTimes
          }]
       });

       window.setInterval(fetchData, FETCH_INTERVAL)
    }

    function fetchData() {
        
    }

    return {
        init: initialise
    };
});
