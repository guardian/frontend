define([
    'helpers/fixtures',
    'helpers/injector'
], function (
    fixtures,
    Injector
) {
    describe('Cross-frame messenger: scroll', function () {
        var scroll, iframe1, iframe2, respond1, respond2, onScroll;

        var fixturesConfig = {
            id: 'page',
            fixtures: [
                '<div id="ad-slot-1" class="js-ad-slot"><div id="iframe1" style="height: 200px"></div></div>',
                '<p style="height: 1000px">&nbsp;</p>',
                '<p style="height: 1000px">&nbsp;</p>',
                '<p style="height: 1000px">&nbsp;</p>',
                '<p style="height: 1000px">&nbsp;</p>',
                '<p style="height: 1000px">&nbsp;</p>',
                '<p style="height: 1000px"n>&nbsp;</p>',
                '<div id="ad-slot-2" class="js-ad-slot"><div id="iframe2" style="height: 200px"></div></div>'
            ]
        };

        var injector = new Injector();
        injector.mock('commercial/modules/messenger', {
            register: function () {}
        });

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/messenger/scroll'
            ], function($1) {
                scroll = $1;
                fixtures.render(fixturesConfig);
                iframe1 = document.getElementById('iframe1');
                iframe2 = document.getElementById('iframe2');
                done();
            });

        });

        afterEach(function () {
            iframe1 = iframe2 = null;
            fixtures.clean(fixturesConfig.id);
        });

        describe('With IntersectionObserver', function () {
            var onIntersect;

            var mockWindow = {
                addEventListener: function (_, callback) {
                    onScroll = callback;
                },
                removeEventListener: function () { onScroll = null; },
                IntersectionObserver: function mockIntersectionObserver(callback) {
                    onIntersect = callback;
                    return Object.freeze({
                        observe:    function() {},
                        unobserve:  function() {},
                        disconnect: function() { onIntersect = null; }
                    });
                }
            };

            beforeEach(function () {
                respond1 = jasmine.createSpy('respond1');
                respond2 = jasmine.createSpy('respond2');
                scroll.reset(mockWindow);
                scroll.addScrollListener(iframe1, respond1);
                scroll.addScrollListener(iframe2, respond2);
            });

            afterEach(function () {
                scroll.removeScrollListener(iframe1);
                scroll.removeScrollListener(iframe2);
                scroll.reset();
            });

            it('should call respond1 but not respond2 at the top of the page', function (done) {
                onIntersect([
                    { target: iframe1, intersectionRatio: .5 },
                    { target: iframe2, intersectionRatio: 0 }
                ]);
                onScroll()
                .then(function () {
                    expect(respond1).toHaveBeenCalled();
                    expect(respond2).not.toHaveBeenCalled();
                })
                .then(done)
                .catch(done.fail);
            });

            it('should call respond2 but not respond1 at the bottom of the page', function (done) {
                onIntersect([
                    { target: iframe1, intersectionRatio: 0 },
                    { target: iframe2, intersectionRatio: .5 }
                ]);
                onScroll()
                .then(function () {
                    expect(respond1).not.toHaveBeenCalled();
                    expect(respond2).toHaveBeenCalled();
                })
                .then(done)
                .catch(done.fail);
            });
        });

        describe('Without IntersectionObserver', function () {
            var mockWindow = {
                addEventListener: function (_, callback) {
                    onScroll = callback;
                },
                removeEventListener: function () { onScroll = null; }
            };

            beforeEach(function () {
                respond1 = jasmine.createSpy('respond1');
                respond2 = jasmine.createSpy('respond2');
                scroll.reset(mockWindow);
                scroll.addScrollListener(iframe1, respond1);
                scroll.addScrollListener(iframe2, respond2);
            });

            afterEach(function () {
                scroll.removeScrollListener(iframe1);
                scroll.removeScrollListener(iframe2);
                scroll.reset();
            });

            it('should call respond1 but not respond2 at the top of the page', function (done) {
                onScroll()
                .then(function () {
                    expect(respond1).toHaveBeenCalled();
                    expect(respond2).not.toHaveBeenCalled();
                })
                .then(done)
                .catch(done.fail);
            });

            it('should call respond2 but not respond1 at the bottom of the page', function (done) {
                window.scrollTo(0, 6300);
                onScroll()
                .then(function () {
                    //expect(respond1).not.toHaveBeenCalled();
                    expect(respond2).toHaveBeenCalled();
                })
                .then(done)
                .catch(done.fail);
            });
        });

    });
});
