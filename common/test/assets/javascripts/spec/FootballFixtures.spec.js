define(['common', 'ajax', 'qwery', 'modules/sport/football/fixtures', 'helpers/fixtures'], function(common, ajax, qwery, FootballFixtures, fixtures) {

    var fixuresConf = {
        id: 'football-fixtures-fixtures',
        fixtures: [
            '<div id="football-fixtures">' +
                '<ul>' +
                    '<li></li>' +
                '</ul>' +
            '</div>'
        ]
    };

    describe("Football fixtures component", function() {

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            fixtures.render(fixuresConf);
            prependTo = qwery('ul > li', '#football-fixtures')[0];
            competitions = [500, 510, 100];

            renderCall = sinon.spy(function(){});
            expandCall = sinon.spy(function(){});

            common.mediator.on('modules:footballfixtures:render', renderCall);
            common.mediator.on('modules:footballfixtures:expand', expandCall);

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
        });

        afterEach(function() {
            fixtures.clean(fixuresConf.id);
        })

        // json test needs to be run asynchronously
        it("should request the given competitions from the fixtures api", function(){
            server.respondWith([200, {}, '{ "html": "<p>foo</p>" }']);
            runs(function() {
                new FootballFixtures({
                    prependTo: prependTo,
                    expandable: true,
                    competitions: competitions
                }).init();
            });

            waitsFor(function () {
                return renderCall.calledOnce === true
            }, "football fixtures callback never called", 500);
        });

        it("should prepend a successful fixtures request to the DOM", function() {
            server.respondWith([200, {}, '{ "html": "<p>foo</p>" }']);
            runs(function() {
                new FootballFixtures({
                    prependTo: prependTo,
                    expandable: true,
                    competitions: competitions
                }).init();
            });
            waitsFor(function () {
                return renderCall.calledOnce === true
            }, "football fixtures callback never called", 500);

            runs(function() {
                expect(document.getElementById('football-fixtures').innerHTML).toContain('<p>foo</p>');
            });
        });

        it("should fail silently if no response is returned from fixtures request", function() {
            server.respondWith([200, {}, 'null']);
            runs(function() {
                new FootballFixtures({
                    prependTo: prependTo,
                    expandable: true,
                    competitions: competitions
                }).init();
            });

            runs(function() {
                expect(renderCall).not.toHaveBeenCalled();
            });
        });

        it("should trigger expandable module", function() {
            server.respondWith([200, {}, '{ "html": "<p>foo</p>" }']);
            runs(function() {
                new FootballFixtures({
                    prependTo: prependTo,
                    expandable: true,
                    competitions: competitions
                }).init();
            });
            waitsFor(function () {
                return expandCall.called === true
            }, "football fixtures callback never called", 500);

            runs(function() {
                expect(expandCall).toHaveBeenCalled();
            });
        });

    });
});
