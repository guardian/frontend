define([
    'helpers/fixtures',
    'helpers/injector'
], function (
    fixtures,
    Injector
) {
    describe('Most popular', function () {
        var fixturesConfig = {
                id: 'most-popular',
                fixtures: [
                    '<div class="js-popular"></div><div class="ad-slot--inline"></div><div class="ad-slot--inline"></div>'
                ]
            },
            html = '<b>popular</b>',
            server,
            injector = new Injector(),
            Popular, config, mediator, detect, commercialFeatures;

        beforeEach(function (done) {
            injector.mock({
                'common/modules/commercial/create-ad-slot': function () {
                    return '<div class="ad-slot"></div>';
                },
                'common/modules/commercial/dfp': {
                    addSlot: function () {},
                    createAdSlot: function () {
                        return '<div class="ad-slot"></div>';
                    }
                }
            });
            injector.require([
                'common/modules/onward/popular',
                'common/modules/commercial/commercial-features',
                'common/utils/config',
                'common/utils/mediator',
                'common/utils/detect'
            ], function () {
                Popular = arguments[0];
                commercialFeatures = arguments[1];
                config = arguments[2];
                mediator = arguments[3];
                detect = arguments[4];

                config.page.section = 'football';
                commercialFeatures.popularContentMPU = true;

                // set up fake server
                server = sinon.fakeServer.create();
                server.autoRespond = true;
                server.autoRespondAfter = 20;
                fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            server.restore();
            fixtures.clean(fixturesConfig.id);
            detect.getBreakpoint = function () { return 'desktop'; };
        });

        // json test needs to be run asynchronously
        it('should request the most popular feed and graft it on to the dom', function (done) {
            var section = 'football';

            server.respondWith('/most-read/' + section + '.json', [200, {}, '{ "html": "' + html + '" }']);
            mediator.once('modules:popular:loaded', function (el) {
                var innerHtml = el.innerHTML;
                expect(innerHtml).toBe('popular');
                done();
            });

            new Popular().init();
        });

        it('should only request global most popular for blacklisted sections', function (done) {
            config.page.section = 'info';

            server.respondWith('/most-read.json', [200, {}, '{ "html": "' + html + '" }']);
            mediator.once('modules:popular:loaded', function (el) {
                var innerHtml = el.innerHTML;
                expect(innerHtml).toBe('popular');
                done();
            });

            new Popular().init();
        });

        it('should render MPU', function () {
            var popular = new Popular();

            popular.prerender();
            expect(typeof popular.$mpu).toEqual('object');
        });

        it('should not render MPU when on mobile and 2+ MPUs are already on the page', function () {
            var popular = new Popular();

            detect.getBreakpoint = function () { return 'mobile'; };
            popular.prerender();
            expect(popular.$mpu).toBeUndefined();
        });

        it('should not render MPU when disabled in commercial-features', function () {
            var popular = new Popular();
            commercialFeatures.popularContentMPU = false;

            popular.prerender();
            expect(popular.$mpu).toBeUndefined();
        });

    });
});
