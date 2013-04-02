define(['analytics/omniture', 'common'], function(Omniture, common) {

    describe("Omniture", function() {

        var config = {};

        var w = {
        	performance: { timing: { requestStart: 1, responseEnd: 5000 } },
        	innerWidth: 500
        }

        beforeEach(function(){

            config.page = { omnitureAccount: 'the_account', analyticsName: 'the_page_name' };
            config.switches = { optimizely: false };

            s = { t: function(){}, tl: function(){} };
            sinon.spy(s, "t");
            sinon.spy(s, "tl");

        });

        it("should correctly set the Omniture account", function(){
            var o = new Omniture(s, config).init();
            expect(s_account).toBe("the_account");
        });

        it("should record clicks with correct analytics name", function(){

            config.page.contentType = 'Article';
            s.pageType = 'article';

            var o = new Omniture(s, config)
            o.init();
            o.populateEventProperties('outer:link');

            expect(s.linkTrackVars).toBe('eVar37,events');
            expect(s.linkTrackEvents).toBe('event37');
            expect(s.events).toBe('event37');
            expect(s.eVar37).toBe("Article:outer:link");

        });

        it("should correctly set page properties", function(){

            s.linkInternalFilters = 'guardian.co.uk,guardiannews.co.uk'
            config.page = {
                    omnitureAccount: 'the_account',
                    webTitle: 'a really long title a really long title a really long title a really long title a really long title a really long title ',
                    contentType: 'Article',
                    pageCode: '12345',
                    section: 'theworld',
                    keywords: 'Syria,Yemen,Egypt,Bahrain',
                    author: 'Brian Whitaker,Haroon Siddique',
                    tones: 'Minute by minutes,News,Blogposts',
                    series: 'The Fiver',
                    blogs: "Middle East Live",
                    buildNumber: "build-73",
                    edition: "US",
                    webPublicationDate: "2012-02-22T16:58:00.000Z",
                    analyticsName: "GFE:theworld:a-really-long-title-a-really-long-title-a-really-long-title-a-really-long"
            };

            var o = new Omniture(s, config, w);
            o.populatePageProperties();

            expect(s.linkInternalFilters).toBe("guardian.co.uk,guardiannews.co.uk,localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com");
            expect(s.pageName).toBe("GFE:theworld:a-really-long-title-a-really-long-title-a-really-long-title-a-really-long");
            expect(s.prop9).toBe("Article");
            expect(s.channel).toBe("theworld");
            expect(s.prop4).toBe("Syria,Yemen,Egypt,Bahrain");
            expect(s.prop6).toBe("Brian Whitaker,Haroon Siddique");
            expect(s.prop8).toBe("12345");
            expect(s.prop10).toBe("Minute by minutes,News,Blogposts");
            expect(s.prop13).toBe("The Fiver");
            expect(s.prop25).toBe("Middle East Live");
            expect(s.prop14).toBe("build-73");
            expect(s.prop47).toBe("US");
            expect(s.prop48).toBe("low");
            expect(s.prop56).toBe("Javascript");
            expect(s.prop30).toBe("content");
            expect(s.prop19).toBe("frontend");
            expect(s.eVar19).toBe("frontend");
            expect(s.cookieDomainPeriods).toBe("2")
        });

        it("should correctly set cookieDomainPeriods for UK edition", function(){

            s.linkInternalFilters = 'guardian.co.uk,guardiannews.co.uk'
            config.page = {
                omnitureAccount: 'the_account',
                edition: "NOT-US"
            };

            var o = new Omniture(s, config, w);
            o.populatePageProperties();

            expect(s.cookieDomainPeriods).toBe("3")
        });

        it("should log a page view event", function() {
            var o = new Omniture(s, config).init();
            waits(100);
            runs(function() {
                expect(s.t).toHaveBeenCalledOnce();
            });
        });

        it("should log a clickstream event", function() {

            var o = new Omniture(s, config)
            o.init();
            waits(100);
            runs(function() {
                common.mediator.emit('module:clickstream:click', ['tag', false, false]);
                expect(s.tl).toHaveBeenCalledOnce();
            });
        });

        it("should not introduce an artificial delay for same-page links or same-host links", function(){

            var o = new Omniture(s, config),
                el = document.createElement("a");

            o.init();
            waits(100);
            runs(function() {
                common.mediator.emit('module:clickstream:click', [el, 'tag', true, true]);   // same-page  (non-delayed s.tl call)
                common.mediator.emit('module:clickstream:click', [el, 'tag', false, false]); // other-host (delayed s.tl call)
                /* Uncomment when Omnitute have implemented localStorage for same-host clicks: */
                //common.mediator.emit('module:clickstream:click', [el, 'tag', false, true]);  // same-host  (no s.tl call; use session storage)
                expect(s.tl.withArgs(el, 'o', 'tag')).toHaveBeenCalledOnce();
                expect(s.tl.withArgs(true, 'o', 'tag')).toHaveBeenCalledOnce();
            });

        });

    });


});

