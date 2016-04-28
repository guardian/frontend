define([
    'helpers/injector',
    'helpers/fixtures'
], function (
    Injector,
    fixtures
) {
    describe('inlineAnalytics', function () {

        var s, analytics, injector = new Injector();

        beforeEach(function (done) {
            injector.require(['analytics'], function () {

                analytics = arguments[0];

                s = {};

                window.s = s;

                done();
            });
        });

        it('should track navigation interactions', function () {
            var t = new Date().getTime();

            var ni = {
                'time': t,
                'pageName': 'testpage',
                'tag': 'tagname'
            };

            analytics.trackNavigationInteraction(ni);


            expect(s.eVar24).toBe('testpage');
            expect(s.eVar37).toBe('tagname');
        });

        it('should track sponsored content pages', function () {

            var fixturesConfig = {
                id: 'liveblog-body',
                fixtures: [
                    '<div data-sponsorship="chicken" data-sponsor="soup" ></div>'
                ]
            };

            fixtures.render(fixturesConfig);

            var contentNodes = document.querySelectorAll('[data-sponsorship]');
            var sponsoredContentArray = Array.prototype.slice.call(contentNodes);

            var results = analytics.getSponsoredContentTrackingData(sponsoredContentArray);


            expect(results[0]).toBe('chicken:soup');
        });
    });
});
