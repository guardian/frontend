define(['common', 'ajax', 'modules/matchnav', 'modules/pageconfig'], function(common, ajax, MatchNav, PageConfig) {

    var config = PageConfig({
        page: {
            section: "football",
            tones: "Match reports, Commercial",
            references:[{paFootballTeam:"2"},{paFootballTeam:"24"}]
        }
    });

    describe("Match Nav", function() {

        var callback,
            server;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            callback = sinon.spy(function(){});
            common.mediator.on('modules:matchnav:loaded', callback);

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
        });

        // json test needs to be run asynchronously
        it("should request the related links and graft them on to the dom", function(){

            server.respondWith([200, {}, '{"nav":"1", "related":"2", "refreshStatus":true}']);

            runs(function() {
                new MatchNav().load("match-stats-nav", document);
            });
            waitsFor(function () {
                return callback.called === true
            }, "match nav callback never called", 500);

            runs(function(){
                expect(document.querySelector(".js-related").innerHTML).toBe('2');
                expect(document.querySelector('.after-header').innerHTML).toBe('1');
            });
        });

    });
});
