import params from 'utils/parse-query-params';
import urlQuery from 'utils/url-query';
import ammend from 'utils/ammended-query-str';

fdescribe('utils/parse-query-params', function () {
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
