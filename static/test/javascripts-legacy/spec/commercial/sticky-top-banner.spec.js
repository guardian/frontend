define([
    'helpers/fixtures',
    'helpers/injector'
], function (
    fixtures,
    Injector
) {
    describe('Sticky ad banner', function () {
        var sticky, detect, header, stickyBanner, messenger, register, commercialFeatures;

        var fixturesConfig = {
            id: 'sticky-ad-banner-test',
            fixtures: [
                '<div id="top-banner-parent"><div id="dfp-ad--top-above-nav"></div></div>' +
                '<div id="header" style="height: 500px"></div>'
            ]
        };

        var mockWindow = {
            addEventListener: jasmine.createSpy('addEventListener'),
            getComputedStyle: window.getComputedStyle.bind(window),
            scrollBy: jasmine.createSpy('scrollBy'),
            pageYOffset: 0
        };

        var injector = new Injector();
        injector.mock('commercial/modules/dfp/track-ad-render', function () {
            return Promise.resolve(true);
        });

        beforeEach(function (done) {
            injector.require([
                'lib/detect',
                'commercial/modules/messenger',
                'commercial/modules/sticky-top-banner',
                'commercial/modules/commercial-features'
            ], function($1, $2, $3, $4) {
                detect = $1;
                messenger = $2;
                sticky = $3;
                commercialFeatures = $4;

                commercialFeatures.stickyTopBannerAd = true;

                spyOn(detect, 'isBreakpoint').and.callFake(function () { return true; });
                register = spyOn(messenger, 'register');

                fixtures.render(fixturesConfig);

                header = document.getElementById('header');
                stickyBanner = document.getElementById('top-banner-parent');

                done();
            },
            done.fail);
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should add listeners and classes', function (done) {
            sticky.init(mockWindow)
            .then(function () {
                expect(register.calls.count()).toBe(1);
                expect(mockWindow.addEventListener).toHaveBeenCalled();
                expect(header.classList.contains('l-header--animate')).toBe(true);
                expect(stickyBanner.classList.contains('sticky-top-banner-ad--animate')).toBe(true);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should not add classes when scrolled past the header', function (done) {
            mockWindow.pageYOffset = 501;
            sticky.init(mockWindow)
            .then(function () {
                mockWindow.pageYOffset = 0;
                expect(header.classList.contains('l-header--animate')).toBe(false);
                expect(stickyBanner.classList.contains('sticky-top-banner-ad--animate')).toBe(false);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should set the slot height and the header top margin', function (done) {
            var randomHeight = Math.random() * 500 | 0;
            sticky.init()
            .then(function () {
                return sticky.resize(randomHeight);
            })
            .then(function () {
                expect(header.style.marginTop).toBe(randomHeight + 'px');
                expect(stickyBanner.style.height).toBe(randomHeight + 'px');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should adjust the scroll position', function (done) {
            var randomHeight = Math.random() * 500 | 0;
            mockWindow.pageYOffset = 501;
            sticky.init(mockWindow)
            .then(function () {
                return sticky.resize(randomHeight);
            })
            .then(function () {
                mockWindow.pageYOffset = 0;
                expect(mockWindow.scrollBy).toHaveBeenCalled();
            })
            .then(done)
            .catch(done.fail);
        });

        it('should include height and paddings when setting the slot height', function (done) {
            var pt = Math.random() * 50 | 0;
            var pb = Math.random() * 50 | 0;
            var h = Math.random() * 500 | 0;
            var topSlot = document.getElementById('dfp-ad--top-above-nav');
            topSlot.style.paddingTop = pt + 'px';
            topSlot.style.paddingBottom = pb + 'px';
            sticky.init()
            .then(function () {
                return sticky.update(h, topSlot);
            })
            .then(function () {
                expect(stickyBanner.style.height).toBe((h + pt + pb) + 'px');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should reset the banner position and top styles at the top of the page', function (done) {
            sticky.onScroll()
            .then(function () {
                expect(stickyBanner.style.position).toBe('');
                expect(stickyBanner.style.top).toBe('');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should position the banner absolutely past the header', function (done) {
            mockWindow.pageYOffset = 501;
            sticky.init(mockWindow)
            .then(sticky.onScroll)
            .then(function () {
                expect(stickyBanner.style.position).toBe('absolute');
                expect(stickyBanner.style.top).toBe('500px');
            })
            .then(done)
            .catch(done.fail);
        });

    });
});
