define([
    'common/utils/fastdom-promise',
    'Promise',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/detect'
], function (
    fastdom,
    Promise,
    $,
    mediator,
    detect) {

    return function () {
        if (detect.getBreakpoint() !== 'mobile') {
            fastdom.read(function () {
                var adId = 'dfp-ad--top-above-nav',
                    $adBanner = $('.js-top-banner-above-nav'),
                    $adBannerInner = $('#' + adId, $adBanner),
                    $header = $('.js-header'),
                    headerHeight = $header.height();

                var topAdRenderedPromise = new Promise(function (resolve) {
                    mediator.on('modules:commercial:dfp:rendered', function (event) {
                        if (event.slot.getSlotElementId() === adId) {
                            resolve();
                        }
                    });
                });

                var getClientAdHeight = function () {
                    return fastdom.read(function () {
                        return $adBannerInner[0].clientHeight;
                    });
                };

                var getLatestAdHeight = function () {
                    var $iframe = $('iframe', $adBanner);
                    var slotWidth = $iframe.attr('width');
                    var slotHeight = $iframe.attr('height');
                    // iframe may not have been injected at this point
                    var isFluidAd = $iframe.length > 0 && [slotWidth, slotHeight].join(',') === '88,70';
                    // fluid ads are currently always 250px high. We can't just read the client height as fluid ads are
                    // injected asynchronously, so we can't be sure when they will be in the dom
                    var fluidAdInnerHeight = 250;
                    var fluidAdPadding = 18;
                    var fluidAdHeight = fluidAdInnerHeight + fluidAdPadding;

                    return isFluidAd
                        ? Promise.resolve(fluidAdHeight)
                        : getClientAdHeight();
                };

                var oldAdHeightPromise = getLatestAdHeight();
                var newAdHeightPromise = topAdRenderedPromise.then(getLatestAdHeight);

                var getCachedAdHeight = function () {
                    return Promise.race([newAdHeightPromise, oldAdHeightPromise]);
                };

                var render = function (state) {
                    fastdom.read(function () {
                        var scrollY = window.scrollY;
                        var scrollX = window.scrollX;

                        fastdom.write(function () {
                            // Reset so we have a clean slate
                            $header.css({
                                'transition': '',
                                'margin-top': ''
                            });
                            $adBanner.css({
                                'position': '',
                                'top': '',
                                'max-height': ''
                            });

                            // Set
                            $header.css({ 'margin-top': state.adHeight });

                            $adBanner.css({ 'max-height': state.adHeight });
                            var userHasScrolledPastHeader = scrollY > headerHeight;
                            if (userHasScrolledPastHeader) {
                                $adBanner.css({
                                    'position': 'absolute',
                                    'top': headerHeight
                                });
                            } else {
                                $adBanner.css({ 'position': 'fixed' });
                            }

                            var scrollIsAtTop = scrollY === 0;
                            var diff = state.adHeight - state.previousAdHeight;
                            var adHeightHasIncreased = diff > 0;
                            if (!scrollIsAtTop && adHeightHasIncreased) {
                                // If the user is not at the top and the ad height has increased,
                                // we want to offset their scroll position
                                window.scrollTo(scrollX, scrollY + diff);
                            } else if (!state.firstRender) {
                                // Otherwise we want to transition the change when it happens.
                                // Avoid an initial transition when we apply the margin top for the first time
                                $header.css('transition', 'margin-top 1s cubic-bezier(0, 0, 0, 0.985)');
                            }
                        });
                    });
                };

                var update = (function () {
                    var previousAdHeight;
                    return function (options) {
                        getCachedAdHeight().then(function (adHeight) {
                            render({
                                adHeight: adHeight,
                                previousAdHeight: previousAdHeight || adHeight,
                                firstRender: options.firstRender || false
                            });
                            previousAdHeight = adHeight;
                        });
                    };
                })();

                //
                // Side effects
                //

                fastdom.write(function () {
                    // will move into stylesheets when productionised
                    $adBanner.css({'overflow': 'hidden', 'transition': 'max-height 1s cubic-bezier(0, 0, 0, 0.985)'});

                    update({ firstRender: true });
                    window.addEventListener('scroll', function () { update({}); });
                    newAdHeightPromise
                        .then(function () { update({}); });
                });
            });
        }
    };
});
