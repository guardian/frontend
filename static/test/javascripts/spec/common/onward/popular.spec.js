define([
    'squire',
    'helpers/fixtures'
], function(
    Squire,
    fixtures
) {

    new Squire()
        .mock({
            'common/modules/commercial/create-ad-slot': function () {
                return '<div class="ad-slot"></div>';
            },
            'common/modules/commercial/dfp': {
                addSlot: function () {},
                createAdSlot: function () {
                    return '<div class="ad-slot"></div>';
                }
            }
        })
        .store(['common/utils/config', 'common/utils/mediator'])
        .require(['common/modules/onward/popular', 'mocks'], function (Popular, mocks) {

            describe('Most popular', function () {
                var fixturesConfig = {
                        id: 'most-popular',
                        fixtures: [
                            '<div class="js-popular"></div>'
                        ]
                    },
                    html = '<b>popular</b>',
                    server;

                beforeEach(function () {
                    mocks.store['common/utils/config'].page.section = 'football';

                    // set up fake server
                    server = sinon.fakeServer.create();
                    server.autoRespond = true;
                    server.autoRespondAfter = 20;
                    $fixturesContainer = fixtures.render(fixturesConfig);
                });

                afterEach(function () {
                    server.restore();
                    fixtures.clean(fixturesConfig.id);
                });

                // json test needs to be run asynchronously
                it("should request the most popular feed and graft it on to the dom", function () {
                    var section = 'football';

                    server.respondWith('/most-read/' + section + '.json', [200, {}, '{ "html": "' + html + '" }']);
                    mocks.store['common/utils/mediator'].once('modules:popular:loaded', function (el) {
                        var innerHtml = el.innerHTML;
                        expect(innerHtml).toBe('popular');
                        done();
                    });

                    new Popular().init();
                });

            });

        });

});
