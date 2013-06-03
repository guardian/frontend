define(['common', 'ajax',  'qwery', 'modules/footballtables'], function(common, ajax, qwery, FootballTable) {

    describe("Football fixtures component", function() {

        var server;
       
        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            prependTo = qwery('ul > li', '#football-tables')[0];
            competition = 100;
            
            renderCall = sinon.spy(function(){});

            common.mediator.on('modules:footballtables:render', renderCall);

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function () {
            server.restore();
        });

        // json test needs to be run asynchronously 
        it("should request the given competitions from the tables api", function(){

            server.respondWith('/football/api/competitiontable?&competitionId=100&_edition=UK', [200, {}, '{ "html": "<p>foo</p>" }']);

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

        it("should prepend a succesful table request to the DOM", function() {

            server.respondWith('/football/api/competitiontable?&competitionId=100&_edition=UK', [200, {}, '{ "html": "<p>foo</p>" }']);

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
