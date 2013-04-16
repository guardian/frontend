define(['common', 'bonzo'], function (common, bonzo) {

    function dayOfWeek(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    }
    
    function monthAbbr(month) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    }
    
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    
    function ampm(n) {
        return n < 12 ? 'am' : 'pm';
    }

    function twelveHourClock(hours) {
        return  hours > 12 ? hours - 12 : hours;
    }

    function isToday(date) {
        var today = new Date();
        return (date.toDateString() === today.toDateString());
    }

    function isYesterday(relative) {
        var today = new Date(),
            yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return (relative.toDateString() === yesterday.toDateString());
    }

    function isValidDate(date) {
        if (Object.prototype.toString.call(date) !== "[object Date]") {
            return false;
        }
        return !isNaN(date.getTime());
    }

    function makeRelativeDate(epoch, showTime) {
        var then = new Date(Number(epoch)),
            now = new Date(),
            delta;

        if (!isValidDate(then)) {
            return false;
        }

        delta = parseInt((now.getTime() - then) / 1000, 10);

        if (delta < 0) {
            return false;

        } else if (delta < 55) {
            return 'Less than a minute ago';

        } else if (delta < 90) {
            return '1 minute ago';

        } else if (delta < (8 * 60)) {
            return (parseInt(delta / 60, 10)).toString(10) +
                ' min ago';

        } else if (delta < (55 * 60)) {
            return (parseInt(delta / 60, 10)).toString(10) +
                ' min ago';

        } else if (delta < (90 * 60)) {
            return '1 hour ago';
        
        } else if (delta < (5 * 60 * 60)) {
            return (Math.round(delta / 3600)).toString(10) +
                ' hours ago';

        } else if (isToday(then)) {
            return 'Today' + withTime(then, true);

        } else if (isYesterday(then)) { // yesterday
            return 'Yesterday' + withTime(then, true);

        } else if (delta < 5 * 24 * 60 * 60) { // less than 5 days
            return [dayOfWeek(then.getDay()), then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                withTime(then, showTime);

        } else {
            return [then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                withTime(then, showTime);

        }
    }
    
    function withTime(date, show) {
        return (show === true)
            ? ', ' + twelveHourClock(date.getHours()) + ':' + pad(date.getMinutes()) + ampm(date.getHours())
            : '';
    }

    function findValidTimestamps(context) {
        // `.blocktime time` used in blog html
        return common.$g('.js-timestamp, .block-time time', context);
    }

    function replaceValidTimestamps(context) {
        findValidTimestamps(context).each(function(e, i) {
            var el = bonzo(e),
                datetime = new Date(el.attr('datetime')),
                // NOTE: if this is in a block (blog), assume we want added time on > 1 day old dates
                relativeDate = makeRelativeDate(datetime.getTime(), bonzo(el.parent()).hasClass('block-time'));

            el.removeClass('js-timestamp');
            if (relativeDate) {
                el.html('<span title="' + el.text() + '">' + relativeDate + '</span>');
            }
        });
    }

     // DEPRECATED: Bindings
    ['related', 'autoupdate'].forEach(function(module) {
        common.mediator.on('modules:' + module + ':render', replaceValidTimestamps);
    });
   
    function init(context) {
        replaceValidTimestamps(context);
    }

    return {
        makeRelativeDate: makeRelativeDate,
        init: init
    };

});
