/* global _: true */
define(function () {
    return function(date) {
        if (!date) { return; }

        var elapsed = (new Date() - new Date(date))/1000,
            period = _.find([
                { secs: 30758400, unit: 'year'},
                { secs: 2563200, unit: 'month'},
                { secs: 86400, unit: 'day'},
                { secs: 3600, unit: 'hour'},
                { secs: 60, unit: 'min'}
            ], function(period) { return elapsed >= period.secs; }),
            units = period ? Math.round(elapsed/period.secs) : null;

        // 60 second leeway for "just now"
        return period ? units + ' ' + period.unit + (units !== 1 ? 's' : '') : elapsed > -60 ? 'just now' : 'ahead';
    };
});