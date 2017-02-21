define([
    'common/utils/url'
], function (
    url
) {
    describe('Url', function () {

        describe('should get url vars', function () {

            [
                ['foo=bar', { foo: 'bar' }],
                ['foo=bar&boo=far', { foo: 'bar', boo: 'far' }],
                ['foo=bar&boo=far&', { foo: 'bar', boo: 'far' }],
                ['foo=bar&boo', { foo: 'bar', boo: true }],
                ['', { }]
            ].forEach(function (dataProvider) {
                var query = dataProvider[0],
                    expected = dataProvider[1];
                it('query: ' + query + ', expected: ' + JSON.stringify(expected), function () {
                    expect(url.getUrlVars({ query: query })).toEqual(expected);
                });
            });

        });

        describe('should be able to construct query', function () {

            [
                [{ foo: 'bar' }, 'foo=bar'],
                [{ foo: 'bar', boo: 'far' }, 'foo=bar&boo=far'],
                [{ foo: ['bar1', 'bar2'], boo: 'far' }, 'foo=bar1,bar2&boo=far'],
                [{ }, '']
            ].forEach(function (dataProvider) {
                var vars = dataProvider[0],
                    expected = dataProvider[1];
                it('vars: ' + JSON.stringify(vars) + ', expected: ' + expected, function () {
                    expect(url.constructQuery(vars)).toEqual(expected);
                });
            });

        });

    });
});
