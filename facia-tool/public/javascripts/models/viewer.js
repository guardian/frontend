define([
    'models/common',
    'knockout'
],
function (
    common,
    ko
){
    var breakpoints = common.config.breakpoints,
        numPoints = breakpoints.length,
        showing = 0;

    function mod(x, m) {
        return ((x % m) + m) % m;
    }

    function layout(startAt) {
        var acc = 0;

        startAt = mod(startAt || 0, numPoints);
        for (var i = 0; i < numPoints; i += 1) {
            point = breakpoints[(i + startAt) % numPoints];

            if (!_.isFunction(point.zIndex)) { point.zIndex = ko.observable() };
            point.zIndex(i);

            if (!_.isFunction(point.left)) { point.left = ko.observable() };
            point.left(acc);

            acc += point.width + 30;
        }
    }

    function shuffleLayout(dir) {
        showing = mod(showing + (dir === -1 ? -1 : 1), numPoints);
        layout(showing);
    }

    layout();

    return {
        breakpoints: ko.observableArray(breakpoints),
        urlBase:     common.config.previewUrl,

        layout:      layout,
        shuffleUp:   function() { shuffleLayout(1) },
        shuffleDown: function() { shuffleLayout(-1) }
    };
});
