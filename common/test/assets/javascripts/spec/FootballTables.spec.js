define(['common', 'ajax',  'qwery', 'modules/footballtables'], function(common, ajax, qwery, FootballTable) {

    describe("Football fixtures component", function() {
       
        beforeEach(function() {
            ajax.init("");
            mockAjax = jasmine.createSpy('ajax');
            prependTo = qwery('ul > li', '#football-tables')[0];
            competition = 100;
            
            renderCall = sinon.spy(function(){});
            expandCall = sinon.spy(function(){});

            common.mediator.on('modules:footballtables:render', renderCall);
            
            runs(function() {
                new FootballTable({
                    prependTo: prependTo,
                    competition: competition
                }).init({ajax: mockAjax});
            });
        });

        // json test needs to be run asynchronously 
        it("should request the given competitions from the tables api", function(){
            waits(500);

            runs(function(){
                expect(mockAjax.wasCalled).toBeTruthy();
                expect(mockAjax.mostRecentCall.args[0].url.indexOf('/football/api/competitiontable?&competitionId=100')).toEqual(0);
            });
        });

        it("should prepend a succesful table request to the DOM", function() {

            waits(500);

            runs(function(){
                mockAjax.mostRecentCall.args[0].success.call(this, {html: '<p>foo</p>'});
                expect(document.getElementById('football-tables').innerHTML).toContain('<p>foo</p>');
                expect(renderCall).toHaveBeenCalled();
            });
        });

        it("should fail silently if no response is returned from table request", function() {

            waits(500);

            runs(function(){
                mockAjax.mostRecentCall.args[0].success.call(this);
                expect(renderCall).not.toHaveBeenCalled();
            });
        });
    });
});
