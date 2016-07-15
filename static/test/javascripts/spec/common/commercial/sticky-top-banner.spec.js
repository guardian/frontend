define([
    'helpers/fixtures',
    'common/utils/$',
    'common/modules/commercial/sticky-top-banner'
], function (
    fixtures,
    $,
    newSticky
) {
    describe('Sticky ad banner', function () {
        var fixture = {
            id: 'sticky-ad-banner-test',
            fixtures: [
                '<div class="ad-banner"><div class="ad-banner-inner"></div></div>' +
                '<div class="header"></div>'
            ]
        };

        var elements;
        beforeEach(function () {
            fixtures.render(fixture);
            elements = {
                $adBanner: $('.ad-banner'),
                $adBannerInner: $('.ad-banner-inner'),
                $header: $('.header'),
                // We can't scroll the Phantom window for some reason, so
                // we mock window instead
                window: { scrollTo: sinon.spy() }
            };
        });

        afterEach(function () {
            fixtures.clean(fixture.id);
        });

        it('when the user is scrolled at the top, it should stick the ad banner', function () {
            var state = {
                shouldTransition: false,
                adHeight: 200,
                previousAdHeight: 200,
                headerHeight: 200,
                scrollCoords: [0,0]
            };
            newSticky.render(elements, state);

            expect(elements.$adBanner.css('position')).toEqual('fixed');
            expect(elements.$adBanner.css('height')).toEqual(state.adHeight + 'px');
            expect(elements.$header.css('margin-top')).toEqual(state.adHeight + 'px');
        });

        it('when the user has scrolled past the sticky (fixed) zone, it should begin pushing the ad banner up', function () {
            var state = {
                shouldTransition: false,
                adHeight: 200,
                previousAdHeight: 200,
                headerHeight: 200,
                scrollCoords: [0,201]
            };
            newSticky.render(elements, state);

            expect(elements.$adBanner.css('position')).toEqual('absolute');
            expect(elements.$adBanner.css('top')).toEqual(state.headerHeight + 'px');
        });

        describe('when an advertisement loads that is taller than the default ad slot', function () {
            it('when the user is scrolled at the top, it should transition the banner height', function () {
                var state = {
                    shouldTransition: true,
                    adHeight: 400,
                    previousAdHeight: 200,
                    headerHeight: 200,
                    scrollCoords: [0,0]
                };
                newSticky.render(elements, state);

                // Stop the ad from overflowing while we transition
                expect(elements.$adBanner.css('overflow')).toEqual('hidden');
                expect(elements.$adBanner.css('transition')).toEqual('height 1s cubic-bezier(0, 0, 0, 0.985)');
                expect(elements.$header.css('transition')).toEqual('margin-top 1s cubic-bezier(0, 0, 0, 0.985)');

                expect(elements.window.scrollTo.callCount).toEqual(0);
            });

            it('when the user is not scrolled at the top, it should scroll the user down to offset the height difference', function () {
                var state = {
                    shouldTransition: false,
                    adHeight: 400,
                    previousAdHeight: 200,
                    headerHeight: 200,
                    scrollCoords: [0,1]
                };
                newSticky.render(elements, state);

                expect(elements.$adBanner.css('transition')).toEqual('all 0s ease 0s');
                expect(elements.$header.css('transition')).toEqual('all 0s ease 0s');

                expect(elements.window.scrollTo).toHaveBeenCalledWith(0, 201);
            });
        });
    });
});
