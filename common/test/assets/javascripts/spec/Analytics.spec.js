define(['analytics'], function(Analytics) {
    
    describe("Analytics", function() {

        it("should correctly set the omniture account", function(){

            //given
            var config = {
                page:{
                    omnitureAccount: 'the_account'
                }
            };

            //when
            new Analytics().submit(config);

            //then
            expect(s_account).toBe("the_account");
        });

        it("should correctly set page properties", function(){

            //given some default Omniture data
            var s = {
                linkInternalFilters: 'guardian.co.uk,guardiannews.co.uk'
            };

            var config = {
                page:{
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
                    webPublicationDate: "2012-02-22T16:58:00.000Z"
                }
            };

            var detect = {
                getLayoutMode: function(){ return "HORIZONTAL"; },
                getConnectionSpeed: function(){ return "slow"; }
            };

            //when I setup the analytics
            new Analytics().setup(config, detect, s);

            //then all omniture properties should be set
            expect(s.linkInternalFilters).toBe("guardian.co.uk,guardiannews.co.uk,localhost,gucode.co.uk,gucode.com,guardiannews.com");

            expect(s.pageName).toBe("a really long title a really long title a really long title a really lon:Article:12345");

            expect(s.pageType).toBe("Article");
            expect(s.prop9).toBe("Article");

            expect(s.channel).toBe("theworld");
            expect(s.prop11).toBe("theworld");

            expect(s.prop4).toBe("Syria,Yemen,Egypt,Bahrain");

            expect(s.prop6).toBe("Brian Whitaker,Haroon Siddique");

            expect(s.prop8).toBe("12345");

            expect(s.prop10).toBe("Minute by minutes,News,Blogposts");

            expect(s.prop13).toBe("The Fiver");

            expect(s.prop25).toBe("Middle East Live");

            expect(s.prop14).toBe("build-73");

            expect(s.prop47).toBe("US");

            expect(s.prop48).toBe("slow");

            expect(s.prop56).toBe("HORIZONTAL");

            expect(s.prop30).toBe("content");

            expect(s.prop19).toBe("frontend");
            expect(s.eVar19).toBe("frontend");
        });

        it("should record clicks with correct analytics name", function(){

            //given
            var analyticsName = null;
            var config = { page:{ contentType: 'Article' } };
            var event = { target: document.querySelector('#click-me') };
            var s = { tl: function(w, o, n) { analyticsName = n; } }

            //when
            new Analytics().clickEvent(event, config, s);

            //then
            expect(analyticsName).toBe("Article | outer div | the link");

        });

        it("should not wait to record clicks for ajax links", function(){

            //given
            var wait = null;
            var analyticsName = null;
            var config = { page:{ contentType: 'Article' } };
            var event = { target: document.querySelector('#click-me-quick') };
            var s = { tl: function(w, o, n) { wait = w; analyticsName = n; } }

            //when
            new Analytics().clickEvent(event, config, s);

            //then
            expect(wait).toBe(false);
            expect(analyticsName).toBe("Article | outer div | the link");
        });

        it("should not record clicks against an element not inside an <a> tag", function(){

            //given
            var analyticsName = null;
            var config = {page:{ contentType: 'Article' } };
            var event = { target: document.querySelector('#not-inside-a-link') };
            var s = { tl: function(w, o, n) { throw "should not be called"; } }

            //when
            new Analytics().clickEvent(event, config, s);

            //then
            expect(analyticsName).toBe(null);
        });
    });
});
