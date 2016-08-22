define(function () {

    var perf = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
    var timings = {};

    // use this time as the start time to resolve Date().getTime() from absolute times to relative times.
    var startDate = new Date().getTime();

    function mark(label) {

        if (perf && 'mark' in perf) {
            perf.mark(label);
        } else {
            timings[label] = getCurrentTime();
        }
    }

    // Returns the ms time when the mark was made.
    function getTiming(label) {
        if (perf) {
            var performanceMark = perf.getEntriesByName(label, 'mark')[0];
            if (performanceMark && 'startTime' in performanceMark) {
                return performanceMark.startTime;
            }
        }

        if (label in timings) {
            return timings[label];
        }
    }

    function getCurrentTime() {
        if (perf && 'now' in perf) {
            return perf.now();
        }
        return new Date().getTime() - startDate;
    }

    return {
        mark: mark,
        getTiming: getTiming,
        getCurrentTime: getCurrentTime
    };
});
