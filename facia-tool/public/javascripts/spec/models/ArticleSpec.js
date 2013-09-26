define(['models/article', 'knockout'], function(Article, knockout) {

    describe('Article Model', function() {

        var article;

        beforeEach(function() {
            article = new Article();
        });

        it('should have an id property', function() {
            expect(article.id()).toBeDefined();
        });

        it('should be hydrated on construction', function() {
            var o = { id: "foo", webTitle: "bar", webPublicationDate: "2012-01-01T00:00:00", importance: 1, colour: 1, fields: { trailText: "gu" }}
            var article = new Article(o)
            expect(article.webTitle()).toBe("bar")
            expect(article.webPublicationDate()).toBe("2012-01-01T00:00:00")
            expect(article.importance()).toBe(1)
            expect(article.colour()).toBe(1)
            expect(article.trailText()).toBe("gu")
        });

        it('should default importance to 50', function() {
            expect(article.importance()).toEqual(50)
        });

        it('should humanize the publication date', function() {
            var d = new Date((new Date() - 300000000)).toISOString() // jasmine date mocking not too good?
              , o = { webPublicationDate: d }
            var article = new Article(o)
            expect(article._humanDate()).toContain('3 days ago')
        });

    });
});
