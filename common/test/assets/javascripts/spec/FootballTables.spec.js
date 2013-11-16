define(['common', 'utils/ajax',  'qwery', 'modules/sport/football/tables', 'helpers/fixtures'], function(common, ajax, qwery, FootballTable, fixtures) {

   var fixuresConf = {
        id: 'football-tables-fixtures',
        fixtures: [
            '<div id="football-tables">' +
                '<ul>' +
                    '<li></li>' +
                '</ul>' +
            '</div>'
        ]
    };

    describe("Football fixtures component", function() {

        var server;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            fixtures.render(fixuresConf);
            prependTo = qwery('ul > li', '#football-tables')[0];
            competition = 100;

            renderCall = sinon.spy(function(){});

            common.mediator.on('modules:footballtables:render', renderCall);

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
        });

        afterEach(function () {
            fixtures.clean(fixuresConf.id);
            server.restore();
        });

        // json test needs to be run asynchronously
        it("should request the given competitions from the tables api", function(){

            server.respondWith('/football/api/competitiontable.json?&competitionId=100&_edition=UK', [200, {}, '{ "html": "<p>foo</p>" }']);

            runs(function(){
                new FootballTable({
                    prependTo: prependTo,
                    competition: competition
                }).init();
            });

            waitsFor(function () {
                return renderCall.calledOnce === true
            }, "football tables callback never called", 500);
        });

        xit("should prepend a succesful table request to the DOM", function() {

            server.respondWith('/football/api/competitiontable.json?&competitionId=100&_edition=UK', [200, {}, '{ "html": "<p>foo</p>" }']);

            runs(function(){
                new FootballTable({
                    prependTo: prependTo,
                    competition: competition
                }).init();
            });

            waitsFor(function () {
                return renderCall.calledOnce === true
            }, "football tables callback never called", 500);

            expect(document.getElementById('football-tables').innerHTML).toContain('<p>foo</p>');
        });

        it("should fail silently if no response is returned from table request", function() {

            server.respondWith('/football/api/competitiontable?&competitionId=100&_edition=UK', [200, {}, '{ "html": "<p>foo</p>" }']);

            runs(function(){
                new FootballTable({
                    prependTo: prependTo,
                    competition: competition
                }).init();
                expect(renderCall).not.toHaveBeenCalled();
            });
        });
    });
});
