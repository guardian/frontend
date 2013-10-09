define([
    'Config',
    'models/common',
    'knockout'
],
function (
    Config,
    common,
    ko
){
    var breakpoints = common.config.breakpoints,
        numPoints = breakpoints.length,
        showing = 0;

    function mod(x, m) {
        return ((x % m) + m) % m;
    }

    function render(startAt) {
        var leftAcc = 0;

        if(_.isUndefined(startAt)) {
            startAt = showing = 0;
        }
        startAt = mod(startAt, numPoints);
        for (var i = 0; i < numPoints; i += 1) {
            point = breakpoints[mod(i + startAt, numPoints)];

            if (!_.isFunction(point.zIndex)) { point.zIndex = ko.observable() };
            point.zIndex(i);

            if (!_.isFunction(point.left)) { point.left = ko.observable() };
            point.left(leftAcc);

            leftAcc += point.width + 30;
        }
    }

    function shuffleLayout(dir) {
        showing = mod(showing + (dir === -1 ? -1 : 1), numPoints);
        render(showing);
    }

    render();

    return {
        breakpoints: ko.observableArray(breakpoints),
        urlBase:     common.config.previewUrls[Config.env === 'prod' ? 'prod' : 'code'],

        render:      render,
        shuffleUp:   function() { shuffleLayout(1) },
        shuffleDown: function() { shuffleLayout(-1) }
    };
});
