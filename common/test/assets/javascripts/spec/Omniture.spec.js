define(['analytics/omniture', 'common/utils/mediator'], function(Omniture, mediator) {

    describe("Omniture", function() {

        var config = {};

        var w = {
        	performance: { timing: { requestStart: 1, responseEnd: 5000 } },
        	innerWidth: 500
        }

        beforeEach(function(){
            config.page = {
                analyticsName: 'the_page_name',
                beaconUrl: ''
            };
            config.switches = {};

            s = { t: function(){}, tl: function(){}, apl: function(){}, getQueryParam: function(){ return 'test'; }, getValOnce: function(){ return 'test'; }, getTimeParting: function(){ return ["4:03PM", "4:00PM", "Thursday", "Weekday"]; } };
            sinon.spy(s, "t");
            sinon.spy(s, "tl");
            sinon.spy(s, "apl");
        });

        afterEach(function(){
            sessionStorage.removeItem('gu.analytics.referrerVars');
        });

        it("should record clicks with correct analytics name", function(){

            config.page.contentType = 'Article';
            s.pageType = 'article';

            var o = new Omniture(s);
            o.go(config);
            o.populateEventProperties('outer:link');

            expect(s.linkTrackVars).toBe('eVar37,eVar7,prop37,events');
            expect(s.linkTrackEvents).toBe('event37');
            expect(s.events).toBe('event37');
            expect(s.eVar37).toBe("Article:outer:link");
            expect(s.prop37).toBe("D=v37");
            expect(s.eVar7).toBe("D=pageName");

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
                    analyticsName: "GFE:theworld:a-really-long-title-a-really-long-title-a-really-long-title-a-really-long",
                    inBodyInternalLinkCount: "7",
                    inBodyExternalLinkCount: "0"
            };

            var o = new Omniture(s, w);
            o.go(config);

            expect(s.linkInternalFilters).toBe("guardian.co.uk,guardiannews.co.uk,localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com");
            expect(s.pageName).toBe("GFE:theworld:a-really-long-title-a-really-long-title-a-really-long-title-a-really-long");
            expect(s.eVar1).toMatch("\\d\\d\\d\\d/\\d\\d/\\d\\d");  // in reality todays date e.g. 2014/05/21
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
            expect(s.prop58).toBe("7");
            expect(s.prop69).toBe("0");
            expect(s.prop68).toBe("low");
            expect(s.prop56).toBe("Javascript");
            expect(s.prop30).toBe("content");
            expect(s.prop19).toBe("frontend");
            expect(s.prop67).toBe("nextgen-served");
            expect(s.eVar19).toBe("frontend");
            expect(s.eVar50).toBe("test");
            expect(s.cookieDomainPeriods).toBe("2")
            expect(s.trackingServer).toBe("hits.theguardian.com");
            expect(s.trackingServerSecure).toBe('hits-secure.theguardian.com');

        });

        it("should correctly set cookieDomainPeriods for UK edition", function(){

            s.linkInternalFilters = 'guardian.co.uk,guardiannews.co.uk'
            config.page = {
                omnitureAccount: 'the_account',
                edition: "NOT-US"
            };

            var o = new Omniture(s, w);
            o.go(config);

            expect(s.cookieDomainPeriods).toBe("2")
        });

        it("should log a page view event", function() {
            var o = new Omniture(s).go(config);
            waits(100);
            runs(function() {
                expect(s.t).toHaveBeenCalledOnce();
            });
        });
        
        it("should send event46 when a page has comments", function(){
            config.page.contentType = 'Article';
            config.page.commentable = true;
            var o = new Omniture(s).go(config);

            expect(s.apl).toHaveBeenCalled();
            expect(s.apl.args[0][1]).toBe('event46');
        });

        it("should log a clickstream event", function() {

            var o = new Omniture(s),
                clickSpec = {
                    target: document.documentElement,
                    samePage: true,
                    sameHost: true,
                    tag: 'something'
                };

            o.go(config);
            waits(100);
            runs(function() {
                mediator.emit('module:clickstream:click', clickSpec);
                expect(s.tl).toHaveBeenCalledOnce();
            });
        });

        it("should send event16 when social button has been clicked", function(){
            var o = new Omniture(s),
                clickSpec = {
                    target: document.documentElement,
                    samePage: false,
                    sameHost: false,
                    tag: 'social | facebook | top'
                }
                ;
            o.go(config);
            waits(100);
            runs(function() {
                mediator.emit('module:clickstream:click', clickSpec);
                expect(s.apl).toHaveBeenCalled();
                expect(s.apl.args[0][1]).toBe('event16');
            });
        });

        it("should make a non-delayed s.tl call for same-page links", function(){

            var o = new Omniture(s),
                el = document.createElement("a"),
                clickSpecSamePage = {
                    target: el,
                    samePage: true,
                    sameHost: true,
                    tag: 'tag'
                };

            o.go(config);
            runs(function() {
                mediator.emit('module:clickstream:click', clickSpecSamePage);  // same page  (non-delayed s.tl call)
                expect(s.tl.withArgs(true, 'o', 'tag')).toHaveBeenCalledOnce();
            });

        });

        it("should use local storage for same-host links", function(){

            var o = new Omniture(s),
                el = document.createElement("a"),
                clickSpec = {
                    target: el,
                    samePage: false,
                    sameHost: true,
                    tag: 'tag in localstorage'
                };

            o.go(config);
            runs(function() {
                mediator.emit('module:clickstream:click', clickSpec);
                expect(JSON.parse(sessionStorage.getItem('gu.analytics.referrerVars')).value.tag).toEqual('tag in localstorage')
            });

        });

        it("should make a delayed s.tl call for other-host links", function(){

            var o = new Omniture(s),
                el = document.createElement("a"),
                clickSpec = {
                    target: el,
                    samePage: false,
                    sameHost: false,
                    tag: 'tag'
                };

            o.go(config);
            runs(function() {
                mediator.emit('module:clickstream:click', clickSpec);
                expect(s.tl.withArgs(el,   'o', 'tag')).toHaveBeenCalledOnce();
            });

        });

    });


});

