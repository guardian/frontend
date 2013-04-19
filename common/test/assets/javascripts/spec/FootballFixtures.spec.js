define(['common', 'ajax', 'qwery', 'modules/footballfixtures'], function(common, ajax, qwery, FootballFixtures) {

    describe("Football fixtures component", function() {

        beforeEach(function() {
            ajax.init("");
            mockAjax = jasmine.createSpy('ajax');
            prependTo = qwery('ul > li', '#football-fixtures')[0];
            competitions = [500, 510, 100];
            
            renderCall = sinon.spy(function(){});
            expandCall = sinon.spy(function(){});

            common.mediator.on('modules:footballfixtures:render', renderCall);
            common.mediator.on('modules:footballfixtures:expand', expandCall);
            
            runs(function() {
                new FootballFixtures({
                    prependTo: prependTo,
                    expandable: true,
                    competitions: competitions
                }).init({ajax: mockAjax});
            });
        });

        // json test needs to be run asynchronously 
        it("should request the given competitions from the fixtures api", function(){
            waits(500);

            runs(function(){
                expect(mockAjax.wasCalled).toBeTruthy();
                expect(mockAjax.mostRecentCall.args[0].url.indexOf('/football/api/frontscores?&competitionId=500&competitionId=510&competitionId=100')).toEqual(0);
            });
        });

        it("should prepend a successful fixtures request to the DOM", function() {

            waits(500);

            runs(function(){
                mockAjax.mostRecentCall.args[0].success.call(this, {html: '<p>foo</p>'});
                expect(document.getElementById('football-fixtures').innerHTML).toContain('<p>foo</p>');
                expect(renderCall).toHaveBeenCalled();
            });
        });

        it("should fail silently if no response is returned from fixtures request", function() {

            waits(500);

            runs(function(){
                mockAjax.mostRecentCall.args[0].success.call(this);
                expect(renderCall).not.toHaveBeenCalled();
            });
        });

        it("should trigger expandable module", function() {
            waits(1000);

            runs(function(){
                mockAjax.mostRecentCall.args[0].success.call(this, {html: '<p>foo</p>'});
                expect(expandCall).toHaveBeenCalled();
            });
        });
    
    });
});
