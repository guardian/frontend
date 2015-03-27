define([
    'underscore'
], function (
    _
) {
    return function(date) {
        var periods = [
                { secs: 30758400, unit: 'year'},
                { secs: 2563200, unit: 'month'},
                { secs: 86400, unit: 'day'},
                { secs: 3600, unit: 'hour'},
                { secs: 60, unit: 'min'}
            ],
            period,
            elapsed,
            abs,
            units,
            str;

        if (!date) { return; }

        elapsed = (new Date() - new Date(date))/1000;

        abs = Math.abs(elapsed);

        period = _.find(periods, function(period) { return abs >= period.secs; });

        units = period ? Math.round(abs/period.secs) : null;

        if (period) {
            str = units + ' ' + period.unit + (units !== 1 ? 's' : '');
            return elapsed < abs ? 'in ' + str : str + ' ago';
        } else {
            return 'just now';
        }
    };
});
