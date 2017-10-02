// @flow
import $ from 'lib/$';
import mediator from 'lib/mediator';
import bonzo from 'bonzo';

type RelativeDateOptions = {
    notAfter?: number,
    format?: string,
    showTime?: boolean,
};

const dayOfWeek = (day): string =>
    [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ][day];

const monthAbbr = (month): string =>
    [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ][month];

const pad = (n): number | string => (n < 10 ? `0${n}` : n);

const isToday = (date): boolean => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
};

const isWithin24Hours = (date): boolean => {
    const today = new Date();
    return date && date.valueOf() > today.valueOf() - 24 * 60 * 60 * 1000;
};

const isWithinSeconds = (date: Date, seconds: number): boolean => {
    const today = new Date();
    return date && date.valueOf() > today.valueOf() - (seconds || 0) * 1000;
};

const isYesterday = (relative): boolean => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    return relative.toDateString() === yesterday.toDateString();
};

const isWithinPastWeek = (date): boolean => {
    const weekAgo = new Date().valueOf() - 7 * 24 * 60 * 60 * 1000;
    return date.valueOf() >= weekAgo;
};

const isValidDate = (date): boolean => {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return false;
    }
    return !isNaN(date.getTime());
};

const getSuffix = (type, format, value): string => {
    let strs;

    const units = {
        s: {
            short: ['s'],
            med: ['s ago'],
            long: [' second ago', ' seconds ago'],
        },
        m: {
            short: ['m'],
            med: ['m ago'],
            long: [' minute ago', ' minutes ago'],
        },
        h: {
            short: ['h'],
            med: ['h ago'],
            long: [' hour ago', ' hours ago'],
        },
        d: {
            short: ['d'],
            med: ['d ago'],
            long: [' day ago', ' days ago'],
        },
    };

    if (units[type]) {
        strs = units[type][format];
        if (value === 1) {
            return strs[0];
        }
        return strs[strs.length - 1];
    }
    return '';
};

const withTime = (date): string =>
    ` ${date.getHours()}:${pad(date.getMinutes())}`;

const makeRelativeDate = (
    epoch: number,
    opts: RelativeDateOptions = {}
): false | string => {
    let minutes;
    let hours;
    let days;
    let delta = 0;
    const then = new Date(Number(epoch));
    const now = new Date();
    const format = opts.format || 'short';
    const extendedFormatting = opts.format === 'short' || opts.format === 'med';

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
    } else if (delta < 55 * 60) {
        minutes = Math.round(delta / 60);
        return minutes + getSuffix('m', format, minutes);
    } else if (isToday(then) || (extendedFormatting && isWithin24Hours(then))) {
        hours = Math.round(delta / 3600);
        return hours + getSuffix('h', format, hours);
    } else if (extendedFormatting && isWithinPastWeek(then)) {
        days = Math.round(delta / 3600 / 24);
        return days + getSuffix('d', format, days);
    } else if (isYesterday(then)) {
        // yesterday
        return `Yesterday${withTime(then)}`;
    } else if (delta < 5 * 24 * 60 * 60) {
        // less than 5 days
        return (
            [
                dayOfWeek(then.getDay()),
                then.getDate(),
                monthAbbr(then.getMonth()),
                then.getFullYear(),
            ].join(' ') + (opts.showTime ? withTime(then) : '')
        );
    }
    return (
        [then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(
            ' '
        ) + (opts.showTime ? withTime(then) : '')
    );
};

const findValidTimestamps = (): bonzo =>
    // `.blocktime time` used in blog html
    $('.js-timestamp, .js-item__timestamp');

const replaceLocaleTimestamps = (html: ?Element): void => {
    const cls = 'js-locale-timestamp';
    const context = html || document;

    $(`.${cls}`, context).each(el => {
        let datetime;
        const $el = bonzo(el);
        const timestamp = parseInt($el.attr('data-timestamp'), 10);

        if (timestamp) {
            datetime = new Date(timestamp);
            el.innerHTML = `${pad(datetime.getHours())}:${pad(
                datetime.getMinutes()
            )}`;
            $el.removeClass(cls);
        }
    });
};

const replaceValidTimestamps = (opts: RelativeDateOptions = {}): void => {
    findValidTimestamps().each(el => {
        let targetEl;
        const $el = bonzo(el);

        const // Epoch dates are more reliable, fallback to datetime for liveblog blocks
        timestamp =
            parseInt($el.attr('data-timestamp'), 10) || $el.attr('datetime');

        const datetime = new Date(timestamp);

        const relativeDate = makeRelativeDate(datetime.getTime(), {
            // NOTE: if this is in a block (blog), assume we want added time on > 1 day old dates
            showTime: bonzo($el.parent()).hasClass('block-time'),
            format: $el.attr('data-relativeformat'),
            notAfter: opts.notAfter,
        });

        if (relativeDate) {
            // If we find .timestamp__text (facia), use that instead
            targetEl = $el[0].querySelector('.timestamp__text') || $el[0];
            if (!targetEl.getAttribute('title')) {
                targetEl.setAttribute('title', bonzo(targetEl).text());
            }
            targetEl.innerHTML = relativeDate;
        } else if (opts.notAfter) {
            $el.addClass('modern-hidden');
        }
    });
};

// DEPRECATED: Bindings
['related', 'autoupdate'].forEach(module => {
    mediator.on(`modules:${module}:render`, replaceValidTimestamps);
});

const init = (opts: RelativeDateOptions = {}): void => {
    replaceValidTimestamps(opts);
    replaceLocaleTimestamps();
};

export { makeRelativeDate, isWithinSeconds, replaceLocaleTimestamps, init };
