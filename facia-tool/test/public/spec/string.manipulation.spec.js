import {CONST} from 'modules/vars';
import params from 'utils/parse-query-params';
import urlQuery from 'utils/url-query';
import serialize from 'utils/serialize-query-params';
import trim from 'utils/full-trim';
import icc from 'utils/internal-content-code';
import isGuardian from 'utils/is-guardian-url';
import urlAbsPath from 'utils/url-abs-path';
import urlHost from 'utils/url-host';
import sanitizeQuery from 'utils/sanitize-api-query';
import sanitizeHtml from 'utils/sanitize-html';
import * as snap from 'utils/snap';
import humanTime from 'utils/human-time';

describe('utils/parse-query-params', function () {
    var value = params('');
    describe('URL Parameters', function () {
        it('parses an empty string', function () {
            expect(value).toEqual({});
        });

        it('parses an url with no parameters', function () {
            value = params('url/with/no/params');
            expect(value).toEqual({});
        });

        it('parses an url with multiple parameters', function () {
            value = params('url?params=1&banana=true&q=search%20string');
            expect(value).toEqual({
                params: '1',
                banana: 'true',
                q: 'search string'
            });
        });

        it('parses an url with duplicate parameters', function () {
            value = params('url?array=1&array=2&array=3&string=array');
            expect(value).toEqual({
                array: '3',
                string: 'array'
            });
        });

        it('parses an url with hash', function () {
            value = params('url?value=this#page');
            expect(value).toEqual({
                value: 'this'
            });
        });
    });

    describe('URL Parameters as array', function () {
        it('parses an url with duplicate parameters', function () {
            value = params('url?array=1&array=2&array=3&string=array', {
                multipleValues: true
            });
            expect(value).toEqual({
                array: ['1', '2', '3'],
                string: ['array']
            });
        });
    });
});

describe('utils/url-query', function () {
    it('extract the search query', function () {
        expect(urlQuery(null)).toBe('');
        expect(urlQuery('')).toBe('');
        expect(urlQuery('#with-hash')).toBe('');
        expect(urlQuery('some_location')).toBe('');
        expect(urlQuery('some_location#with-hash')).toBe('');
        expect(urlQuery('some_location?fruit=banana')).toBe('fruit=banana');
        expect(urlQuery('some_location?fruit=banana&color=yellow')).toBe('fruit=banana&color=yellow');
        expect(urlQuery('some_location?fruit=banana&color=yellow')).toBe('fruit=banana&color=yellow');
        expect(urlQuery('some_location?fruit=banana#peeled')).toBe('fruit=banana');
    });
});

describe('utils/serialize-query-params', function () {
    it('extract the search query', function () {
        expect(serialize({})).toBe('');
        expect(serialize({ test: 'that' })).toBe('test=that');
        expect(serialize({ test: 'that', fruit: 'apple' })).toBe('test=that&fruit=apple');
        expect(serialize({ test: 'that', empty: undefined, string: '' })).toBe('test=that&string=');
        expect(serialize({ test: 'encode:this' })).toBe('test=encode:this');
        // overrides
        expect(serialize(
            { test: 'that' },
            { test: 'this' }
        )).toBe('test=this');
        expect(serialize(
            { test: 'that', another: 'string' },
            { test: 'this', empty: undefined }
        )).toBe('test=this&another=string');
        expect(serialize(
            { test: 'that' },
            { test: undefined }
        )).toBe('');
        expect(serialize(
            { test: 'that' },
            { test: 'this', that: 'there' },
            { that: 'here', test: 'what' },
            { test: 'again' }
        )).toBe('test=again&that=here');
    });
});

describe('utils/full-trim', function () {
    it('trims strings', function () {
        expect(trim('something')).toBe('something');
        expect(trim('something    ')).toBe('something');
        expect(trim('    something    ')).toBe('something');
        expect(trim('    something    with lots    of spaces ')).toBe('something with lots of spaces');
    });
});

describe('utils/internal-content-code', function () {
    it('generate internal content codes', function () {
        expect(icc()).toBeUndefined();
        expect(icc({})).toBeUndefined();
        expect(icc({
            fields: {}
        })).toBeUndefined();
        expect(icc({
            fields: {
                internalContentCode: 'banana'
            }
        })).toBe(CONST.internalContentPrefix + 'banana');
    });
});

describe('utils/is-guardian-url', function () {
    it('matches guardian domain', function () {
        expect(isGuardian('http://' + CONST.mainDomain)).toBe(true);
        expect(isGuardian('https://' + CONST.mainDomain)).toBe(true);
        expect(isGuardian('http://guaridian.it')).toBe(false);
        expect(isGuardian('https://' + CONST.mainDomain + '/')).toBe(true);
        expect(isGuardian('https://' + CONST.mainDomain + '/uk?search=fruit#hash')).toBe(true);
    });
});

describe('utils/url-host', function () {
    it('extract the domain', function () {
        expect(urlHost()).toBeUndefined();
        expect(urlHost('http://www.fruit.com')).toBe('www.fruit.com');
        expect(urlHost('http://theguardian.com/')).toBe('theguardian.com');
        expect(urlHost('http://theguardian.com?search=this')).toBe('theguardian.com');
    });
});

describe('utils/sanitize-api-query', function () {
    it('extract the domain', function () {
        expect(sanitizeQuery('search')).toBe('search');
        expect(sanitizeQuery('search?q=fruit&color=yellow')).toBe('search?q=fruit&color=yellow');
        expect(sanitizeQuery('search?q=fruit&api-key=xxx&shape=&ripe=true')).toBe('search?q=fruit&ripe=true');
        expect(sanitizeQuery('search?q=&shape=')).toBe('search');
    });
});

describe('utils/sanitize-html', function () {
    it('cleans the html', function () {
        expect(sanitizeHtml(12)).toBe(12);
        expect(sanitizeHtml('text')).toBe('text');
        expect(sanitizeHtml('text<b>hi</b>')).toBe('text<b>hi</b>');
        expect(sanitizeHtml('text<script src="hello.js"/>')).toBe('text');
        expect(sanitizeHtml('text<script src="hello.js"></script>')).toBe('text');
        expect(sanitizeHtml('text<script>alert(\'banana\')</script>')).toBe('text');
    });
});

describe('utils/snap', function () {
    it('generates an id', function () {
        expect(snap.generateId()).toMatch(/^snap\/\d+$/);
    });

    it('validate a snap', function () {
        expect(snap.validateId('snap/1234')).toBe('snap/1234');
        expect(snap.validateId('/snap/2345')).toBe('snap/2345');
        expect(snap.validateId('http://theguardian.com/snap/3456')).toBe('snap/3456');
        expect(snap.validateId('https://anotherurl.com/snap/4567')).toBe('snap/4567');
    });
});

describe('utils/url-abs-path', function () {
    it('extracts the path name', function () {
        expect(urlAbsPath('banana')).toBe('banana');
        expect(urlAbsPath('banana?peel=from-top')).toBe('banana');
        expect(urlAbsPath('/banana#handle')).toBe('banana');
        expect(urlAbsPath('https://anotherurl.com/banana#handle')).toBe('banana');
        expect(urlAbsPath('https://anotherurl.com/banana/for/free?q=hello')).toBe('banana/for/free');
    });
});

describe('utils/human-time', function () {
    it('converts to a readable time', function () {
        expect(humanTime()).toBeUndefined();

        var now = new Date();

        var justnow = new Date(now);
        justnow.setSeconds(0);
        expect(humanTime(justnow, now)).toBe('just now');

        var minutes = new Date(now);
        minutes.setMinutes(minutes.getMinutes() - 3);
        expect(humanTime(minutes, now)).toBe('3 mins ago');

        var hours = new Date(now);
        hours.setHours(hours.getHours() - 4);
        expect(humanTime(hours, now)).toBe('4 hours ago');

        var days = new Date(now);
        days.setDate(days.getDate() - 5);
        expect(humanTime(days, now)).toBe('5 days ago');

        var months = new Date(now);
        months.setMonth(months.getMonth() - 1);
        expect(humanTime(months, now)).toBe('1 month ago');

        var years = new Date(now);
        years.setFullYear(years.getFullYear() - 1);
        expect(humanTime(years, now)).toBe('1 year ago');

        // test the rounding
        var hoursRound = new Date(now);
        hoursRound.setHours(hoursRound.getHours() - 1);
        hoursRound.setMinutes(hoursRound.getMinutes() - 45);
        expect(humanTime(hoursRound, now)).toBe('2 hours ago');

        // future
        var future = new Date(now);
        future.setSeconds(future.getSeconds() + 90);
        expect(humanTime(future, now)).toBe('in 2 mins');
    });
});
