define(['modules/more-matches', 'bonzo', 'qwery', 'common', 'ajax'], function(MoreMatches, bonzo, qwery, common, ajax) {

    describe("MoreMatches", function() {

        var server;

        beforeEach(function () {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;

            server.respondWith([200, {}, '{ "html": "<p>foo</p>", "more": "fixtures/football-next" }']);
        });

        afterEach(function () {
            server.restore();
        });

        var footballIndexRegex = /\/football(\/.*)?\/(fixtures|results)$/g;
        var matchesNav = document.getElementById('matches-nav');
        var firstLink = qwery('a', matchesNav)[0];
        var originalLinkHref = firstLink.getAttribute('href');

        var validPath = {
            "window":{
                location:{
                    pathname: "/football/fixtures"
                }
            }
        };

        // we don't support ajax nav for date pages
        var invalidPath = {
            "window":{
                location:{
                    pathname: "/football/results/2012/oct/21"
                }
            }
        };

        var showMoreMatches = function () {
            MoreMatches.init(matchesNav);
        };

        // need a spy for each as the first test should call the first spy
        var spy_showMoreMatches1 = sinon.spy(function(){});
        var spy_showMoreMatches2 = sinon.spy(function(){});

        var spy_callback = sinon.spy(function(){});

        // simulated context
        with (validPath) {

            if (window.location.pathname.match(footballIndexRegex)) {
                spy_showMoreMatches1();
            }

             it("should initialise on a valid URL", function(){
                expect(spy_showMoreMatches1).toHaveBeenCalled();
            });

        }

        with (invalidPath) {

            if (window.location.pathname.match(footballIndexRegex)) {
                spy_showMoreMatches2();
            }

             it("should not initialise on a valid URL", function(){
                expect(spy_showMoreMatches2).not.toHaveBeenCalled();
            });

        }

        with (validPath) {

            if (window.location.pathname.match(footballIndexRegex)) {
                showMoreMatches();
            }

            it("should remove the non-ajax CSS styling", function() {
                expect(matchesNav.className).not.toContain('js-not-ajax');
            });

            it("should add the call-to-action CSS styling", function() {
                expect(firstLink.className).toContain('cta');
            });

            it("should change the link text to match the data attribute", function() {
                var dataName = firstLink.getAttribute('data-js-title');
                expect(bonzo(firstLink).text()).toEqual(dataName);
            });

            it("should return some HTML when clicked", function() {
                common.mediator.on('ui:more-matches:clicked', spy_callback);
                common.mediator.emit('ui:more-matches:clicked', firstLink);
                expect(spy_callback).toHaveBeenCalled();
            });

            it("should return some HTML when clicked", function() {
                common.mediator.on('ui:more-matches:clicked', spy_callback);
                common.mediator.emit('ui:more-matches:clicked', firstLink);
                expect(spy_callback).toHaveBeenCalled();
            });

            waits(1000); // give ajax time to finish

            it("should change the link href to point to the next day's results once clicked", function(){
                expect(firstLink.getAttribute('href')).not.toBe(originalLinkHref);
            });

        }


    });

});
