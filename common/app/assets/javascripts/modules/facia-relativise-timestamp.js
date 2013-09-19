define(['common', 'bonzo'], function (common, bonzo) {

    return function(timestamp) {
        var _$timestamp = bonzo(timestamp),
            _relativiseDatetime = function (then) {
                var delta = (new Date() - new Date(then)) / 1000,
                    units = {
                        'minute': 60,
                        'hour': 60 * 60,
                        'day': 60 * 60 * 24
                    };
                if (delta < units.minute) {
                    return delta + 's';
                } else if (delta < units.hour) {
                    return Math.floor(delta / units.minute) + 'm';
                } else if (delta < units.day) {
                    return Math.floor(delta / units.hour) + 'h';
                } else {
                    return Math.floor(delta / units.day) + 'd';
                }
            };

        this.relativise = function () {
            var dataAttr = 'data-is-relativised';
            if (_$timestamp.attr(dataAttr)) {
                return;
            }
            var relativeTime = _relativiseDatetime(parseInt(_$timestamp.attr('data-timestamp'), 10));
            // update text
            common.$g('.timestamp__text', _$timestamp[0])
                .text(relativeTime);
            // flag
            _$timestamp.attr(dataAttr, true);
        };
    };

});
