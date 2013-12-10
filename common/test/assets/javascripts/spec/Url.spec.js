define(['utils/url'], function(url) {

    describe('Url', function() {
        
        describe('should get url vars', function() {
        
            [
                ['foo=bar', { foo: 'bar' }], 
                ['foo=bar&boo=far', { foo: 'bar', boo: 'far' }],
                ['', { }]
            ].forEach(function(dataProvider) {
                var query = dataProvider[0],
                    expected = dataProvider[1];
                it('query: ' + query +', expected: ' + JSON.stringify(expected), function() {
                    expect(url.getUrlVars({ query: query })).toEqual(expected);
                });
            });
        
        })

    });

});
