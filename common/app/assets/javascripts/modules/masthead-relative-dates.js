define(['common', 'bonzo'], function (common, bonzo) {

    var units = {
        'minute': 60,
        'hour': 60 * 60,
        'day': 60 * 60 * 24
    };

    function relativise(then) {
        var delta = (new Date() - new Date(then)) / 1000;
        if (delta < units.minute) {
            return delta + 's';
        } else if (delta < units.hour) {
            return Math.floor(delta / units.minute) + 'm';
        } else if (delta < units.day) {
            return Math.floor(delta / units.hour) + 'h';
        } else {
            return Math.floor(delta / units.day) + 'd';
        }
    }

    function init(context) {
        [].forEach.call(context.querySelectorAll('.js-item__timestamp'), function(timestamp) {
            var relativeTime = relativise(bonzo(timestamp).attr('datetime'));
            common.$g('.timestamp__text', timestamp).text(relativeTime);
        });
    }

    return {
        init: init
    };

});
