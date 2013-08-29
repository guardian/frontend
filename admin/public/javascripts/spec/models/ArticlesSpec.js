define(['models/articles', 'knockout'], function(Articles, knockout) {

    describe('Articles Model', function() {

        var articles;

        beforeEach(function() {
            articles = new Articles();
        });

        // TODO each of these should populate self.articles & self.cache
        it('should search the Content API for a search term', function() {

            var mockReqwest = jasmine.createSpy('Reqwest');
            var articles = new Articles( {reqwest: mockReqwest} );
            articles.term('a b'); // ensure this string contains something to encodeURI
            var results = articles.search()
            waits(500);

            runs( function () {
                    expect(mockReqwest.wasCalled).toBeTruthy();
                    expect(mockReqwest.mostRecentCall.args[0].url).toBe('/api/proxy/search?show-fields=all&page-size=50&format=json&q=a%20b');

                  });
        });

        it('should search for an individual api item', function() {

            var mockReqwest = jasmine.createSpy('Reqwest');
            var articles = new Articles( {reqwest: mockReqwest} );
            articles.term('world/2013/jan/27/brazil-nightclub-blaze-high-death-toll');
            var results = articles.search()
            waits(500);

            runs( function () {
                    expect(mockReqwest.wasCalled).toBeTruthy();
                    expect(mockReqwest.mostRecentCall.args[0].url).toBe('/api/proxy/world/2013/jan/27/brazil-nightclub-blaze-high-death-toll?show-fields=all&format=json');
                  });
        });

    });
});
