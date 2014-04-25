define([
    'common/common',
    'bonzo'
], function (
    common,
    bonzo
) {

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

    function isWithin24Hours(date) {
        var today = new Date();
        return (date.valueOf() > today.valueOf() - (24 * 60 * 60 * 1000));
    }

    function isYesterday(relative) {
        var today = new Date(),
            yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return (relative.toDateString() === yesterday.toDateString());
    }

    function isWithinPastWeek(date) {
        var weekAgo = new Date().valueOf() - (7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= weekAgo;
    }

    function isValidDate(date) {
        if (Object.prototype.toString.call(date) !== '[object Date]') {
            return false;
        }
        return !isNaN(date.getTime());
    }

    function getSuffix(type, format, value) {
        var units = {
            s: {
                'short': ['s'],
                'med': ['s ago'],
                'long':  [' second ago', ' seconds ago']
            },
            m: {
                'short': ['m'],
                'med': ['m ago'],
                'long':  [' minute ago', ' minutes ago']
            },
            h: {
                'short': ['h'],
                'med': ['h ago'],
                'long':  [' hour ago', ' hours ago']
            },
            d: {
                'short': ['d'],
                'med': ['d ago'],
                'long':  [' day ago', ' days ago']
            }
        };
        if (units[type]) {
            var strs = units[type][format];
            if (value === 1) {
                return strs[0];
            } else {
                return strs[strs.length-1];
            }
        } else {
            return '';
        }
    }

    function makeRelativeDate(epoch, opts) {
        opts = opts || {};

        var then = new Date(Number(epoch)),
            now = new Date(),
            delta,
            format = opts.format || 'short',
            extendedFormatting = (opts.format === 'short' || opts.format === 'med');

        if (!isValidDate(then)) {
            return false;
        }

        delta = parseInt((now.getTime() - then) / 1000, 10);

        if (delta < 0) {
            return false;

        } else if (opts.notAfter && delta > opts.notAfter) {
            return false;

        } else if (delta < 55) {
            return delta + getSuffix('s', format, delta);

        } else if (delta < (55 * 60)) {
            var minutes = Math.round(delta / 60, 10);
            return minutes + getSuffix('m', format, minutes);

        } else if (isToday(then) || (extendedFormatting && isWithin24Hours(then))) {
            var hours = Math.round(delta / 3600);
            return hours + getSuffix('h', format, hours);

        } else if (extendedFormatting && isWithinPastWeek(then)) {
            var days = Math.round(delta / 3600 / 24);
            return days + getSuffix('d', format, days);

        } else if (isYesterday(then)) { // yesterday
            return 'Yesterday' + withTime(then);

        } else if (delta < 5 * 24 * 60 * 60) { // less than 5 days
            return [dayOfWeek(then.getDay()), then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                   (opts.showTime ? withTime(then) : '');

        } else {
            return [then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                   (opts.showTime ? withTime(then) : '');

        }
    }

    function withTime(date) {
        return ', ' + twelveHourClock(date.getHours()) + ':' + pad(date.getMinutes()) + ampm(date.getHours());
    }

    function findValidTimestamps(context) {
        // `.blocktime time` used in blog html
        return common.$g('.js-timestamp, .js-item__timestamp', context);
    }

    function replaceValidTimestamps(context, opts) {
        opts = opts || {};

        findValidTimestamps(context).each(function(el) {
            var $el = bonzo(el),
                timestamp = parseInt($el.attr('data-timestamp'), 10) || $el.attr('datetime'), // Epoch dates are more reliable, fallback to datetime for liveblog blocks
                datetime = new Date(timestamp),
                relativeDate = makeRelativeDate(datetime.getTime(), {
                                  // NOTE: if this is in a block (blog), assume we want added time on > 1 day old dates
                                  showTime: bonzo($el.parent()).hasClass('block-time'),
                                  format:   $el.attr('data-relativeformat'),
                                  notAfter: opts.notAfter
                               });

            $el.removeClass('js-timestamp');

            if (relativeDate) {
                // If we find .timestamp__text (facia), use that instead
                var targetEl = $el[0].querySelector('.timestamp__text') || $el[0];

                if (!targetEl.getAttribute('title')) {
                    targetEl.setAttribute('title', bonzo(targetEl).text());
                }
                targetEl.innerHTML = relativeDate;
            } else if (opts.notAfter) {
                $el.addClass('js-hidden');
            }
        });
    }

     // DEPRECATED: Bindings
    ['related', 'autoupdate'].forEach(function(module) {
        common.mediator.on('modules:' + module + ':render', replaceValidTimestamps);
    });

    function init(context, opts) {
        replaceValidTimestamps(context, opts);
    }

    return {
        makeRelativeDate: makeRelativeDate,
        init: init
    };

});
