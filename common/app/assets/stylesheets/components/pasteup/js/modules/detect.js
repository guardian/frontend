/*
    Module: detect.js
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*jshint strict: false */

define(function () {

    var BASE_WIDTH     = 400,
        MEDIAN_WIDTH   = 650,
        EXTENDED_WIDTH = 900;
    
    function getLayoutMode() {
        var width = window.innerWidth;

        var mode = "base";
        if (width > BASE_WIDTH) {
            mode = "median";
        }
        if (width > MEDIAN_WIDTH) {
            mode = "extended";
        }

        return mode;
    }

    function getPixelRatio() {
        return window.devicePixelRatio;
    }

    function getPageSpeed() {
        var start_time,
            end_time,
            total_time;

        var perf = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
        if (perf && perf.timing) {
            start_time =  perf.timing.requestStart || perf.timing.fetchStart || perf.timing.navigationStart;
            end_time = perf.timing.responseStart;

            if (start_time && end_time) {
                total_time = end_time - start_time;
            }
        }

        return total_time;
    }

    function getConnectionSpeed() {

        var load_time = getPageSpeed();

        // Assume high speed for non supporting browsers.
        var speed = "high";

        if (load_time) {
            if (load_time > 1000) { // One second
                speed = 'medium';
                if (load_time > 4000) { // Four seconds
                    speed = 'low';
                }
            }
        }
        
        return speed;

    }

    function getBatteryLevel() {
        var battery = navigator.battery;

        // If we don't know then assume we're good.
        var level = "high";

        if (battery && !battery.charging) {
            if (battery.level < 0.6) {
                level = "medium";
            }
            if (battery.level < 0.3) {
                level = "low";
            }
        }

        return level;
    }

    return {
        getLayoutMode: getLayoutMode,
        getPixelRatio: getPixelRatio,
        getConnectionSpeed: getConnectionSpeed,
        getBatteryLevel: getBatteryLevel
    };

});