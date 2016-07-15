define(function () {

    var perf = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
    var timings = {};

    function mark(label) {

        if (perf && 'mark' in perf) {
            perf.mark(label);
        } else {
            timings[label] = new Date();
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

        if (label in timings && 'getTime' in timings[label]) {
            return timings[label].getTime();
        }
    }

    function getCurrentTime() {
        if (perf && 'now' in perf) {
            return perf.now();
        }
        return new Date().getTime();
    }

    return {
        mark: mark,
        getTiming: getTiming,
        getCurrentTime: getCurrentTime
    };
});
