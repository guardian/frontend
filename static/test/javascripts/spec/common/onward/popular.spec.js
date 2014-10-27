define([
    'helpers/fixtures',
    'jasq'
], function(fixtures) {

    describe("Most popular", {
        moduleName: 'common/modules/onward/popular',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        page: {
                            section: 'football'
                        }
                    };
                },
                'common/modules/commercial/create-ad-slot': function () {
                    return function () {
                        return '<div class="ad-slot"></div>';
                    }
                },
                'common/modules/commercial/dfp': function () {
                    return {
                        addSlot: function () {},
                        createAdSlot: function () {
                            return '<div class="ad-slot"></div>';
                        }
                    }
                }
            }
        },
        specify: function () {
            var fixturesConfig = {
                    id: 'most-popular',
                    fixtures: [
                        '<div class="js-popular"></div>'
                    ]
                },
                html = '<b>popular</b>',
                server;

            beforeEach(function () {
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
            it("should request the most popular feed and graft it on to the dom", function (Popular, deps, done) {
                var section = 'football';

                server.respondWith('/most-read/' + section + '.json', [200, {}, '{ "html": "' + html + '" }']);
                deps['common/utils/ajax'].init({page: {
                    ajaxUrl: "",
                    edition: "UK"
                }});
                deps['common/utils/mediator'].once('modules:popular:loaded', function (el) {
                    var innerHtml = el.innerHTML;
                    expect(innerHtml).toBe('popular');
                    done();
                });

                new Popular().init();
            });
        }
    });
});
