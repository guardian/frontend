define(['modules/debug', 'common', 'bonzo'], function(Debug, common, bonzo) {

    describe('Debug', function() {

        var debugPanel = bonzo(bonzo.create('<div id="dev-debug"></div>'));

        beforeEach(function() {
            common.$g('body').append(debugPanel[0]);
        });

        afterEach(function() {
            debugPanel.remove();
        });

        it('should show if dev-debug user pref on', function() {
            var userPrefs = {
                    get: sinon.stub().returns('true')
                },
                debug = new Debug({userPrefs: userPrefs});
            debug.show();
            expect(debugPanel.hasClass('active')).toBeTruthy();
        })

        it('should emit "modules:debug:render"', function() {
            var userPrefs = {
                    get: sinon.stub().returns('true')
                },
                debug = new Debug({userPrefs: userPrefs}),
                emitSpy = sinon.spy(common.mediator, 'emit');
            debug.show();
            expect(emitSpy).toHaveBeenCalledWith('modules:debug:render');
            emitSpy.restore();
        })

    });

});
