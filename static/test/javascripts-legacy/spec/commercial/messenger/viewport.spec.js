define([
    'helpers/fixtures',
    'helpers/injector'
], function (
    fixtures,
    Injector
) {
    describe('Cross-frame messenger: viewport', function () {
        var width = 800;
        var height = 600;
        var viewport, iframe1, respond1, onResize;

        var fixturesConfig = {
            id: 'viewport-page',
            fixtures: [
                '<div id="ad-slot-1" class="js-ad-slot"><div id="iframe1" style="height: 200px"></div></div>'
            ]
        };

        var mockWindow = {
            addEventListener: function (_, callback) {
                onResize = callback;
            },
            removeEventListener: function () { onResize = null; }
        };

        var injector = new Injector();

        injector.mock('lib/detect', {
            getViewport: function () {
                return {
                    width: width,
                    height: height
                };
            }
        });

        injector.mock('commercial/modules/messenger', {
            register: function () {}
        });

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/messenger/viewport'
            ], function($1) {
                viewport = $1;
                fixtures.render(fixturesConfig);
                iframe1 = document.getElementById('iframe1');
                respond1 = jasmine.createSpy('respond1');
                viewport.reset(mockWindow);
                done();
            });
        });

        afterEach(function () {
            iframe1 = null;
            viewport.reset();
            fixtures.clean(fixturesConfig.id);
        });

        it('should send viewport dimensions as soon as the iframe starts listening', function (done) {
            viewport.addResizeListener(iframe1, respond1)
            .then(function () {
                expect(respond1).toHaveBeenCalledWith(null, { width: width, height: height });
            })
            .then(done)
            .catch(done.fail);
        });

        it('should send viewport dimensions when the window gets resized', function (done) {
            viewport.addResizeListener(iframe1, respond1)
            .then(function () {
                height = 768;
                width = 1024;
                return onResize();
            })
            .then(function () {
                expect(respond1).toHaveBeenCalledWith(null, { width: width, height: height });
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
