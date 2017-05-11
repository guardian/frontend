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
            html = '<b>most viewed</b>',
            server,
            injector = new Injector(),
            Popular, config, mediator, detect;

        beforeEach(function (done) {
            injector.mock({
                'commercial/modules/dfp/create-slot': function () {
                    return '<div class="ad-slot"></div>';
                },
                'commercial/modules/dfp/add-slot': {
                    addSlot: function () {
                        /* noop */
                    }
                }
            });
            injector.require([
                'common/modules/onward/popular',
                'lib/config',
                'lib/mediator',
                'lib/detect'
            ], function () {
                Popular = arguments[0];
                config = arguments[1];
                mediator = arguments[2];
                detect = arguments[3];

                config.page.section = 'football';

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
                expect(innerHtml).toBe('most viewed');
                done();
            });

            new Popular().init();
        });

        it('should only request global most popular for blacklisted sections', function (done) {
            config.page.section = 'info';

            server.respondWith('/most-read.json', [200, {}, '{ "html": "' + html + '" }']);
            mediator.once('modules:popular:loaded', function (el) {
                var innerHtml = el.innerHTML;
                expect(innerHtml).toBe('most viewed');
                done();
            });

            new Popular().init();
        });
    });
});
