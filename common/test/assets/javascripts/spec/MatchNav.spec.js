define(['common', 'ajax', 'modules/matchnav', 'modules/pageconfig'], function(common, ajax, MatchNav, PageConfig) {

    var config = PageConfig({
        page: {
            section: "football",
            tones: "Match reports, Commercial",
            references:[{paFootballTeam:"2"},{paFootballTeam:"24"}]
        }
    });

    describe("Match Nav", function() {

        var callback;

        beforeEach(function() {
            ajax.init("");
            callback = sinon.spy(function(){});
            common.mediator.on('modules:matchnav:loaded', callback);
        });

        // json test needs to be run asynchronously 
        it("should request the related links and graft them on to the dom", function(){

            runs(function() {
                new MatchNav().load("fixtures/match-stats-nav");
            });

            waits(500);

            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
                expect(document.getElementById("js-related").innerHTML).toBe('2');
                expect(document.querySelector('.after-header').innerHTML).toBe('1');
            });
        });

    });
});
