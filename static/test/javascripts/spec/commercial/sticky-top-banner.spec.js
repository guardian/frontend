define([
    'helpers/fixtures',
    'helpers/injector'
], function (
    fixtures,
    Injector
) {
    describe('Sticky ad banner', function () {
        var sot, header, stickyBanner, messenger, register, unregister;

        var fixturesConfig = {
            id: 'sticky-ad-banner-test',
            fixtures: [
                '<div id="top-banner-parent"><div id="dfp-ad--top-above-nav"></div></div>' +
                '<div id="header"></div>'
            ]
        };

        var injector = new Injector();
        injector.mock('common/utils/detect', {
            isBreakpoint: function () { return true; }
        });

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/messenger',
                'commercial/modules/sticky-top-banner'
            ], function($1, $2) {
                messenger = $1;
                sot = $2;

                register = spyOn(messenger, 'register');
                unregister = spyOn(messenger, 'unregister');

                fixtures.render(fixturesConfig);

                header = document.getElementById('header');
                stickyBanner = document.getElementById('top-banner-parent');

                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should set the slot height and the header top margin', function (done) {
            var randomHeight = Math.random() * 500 | 0;
            sut.resizeStickyBanner()
            .then(function () {
                expect(header.style.marginTop).toBe(randomHeight + 'px');
                expect(stickyBanner.style.height).toBe(randomHeight + 'px')
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
