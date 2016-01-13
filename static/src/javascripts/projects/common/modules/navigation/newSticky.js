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
                    $header = $('.js-header'),
                    oldAdHeight = $adBanner.height(),
                    headerHeight = $header.height();

                var topAdRenderedPromise = new Promise(function (resolve) {
                    mediator.on('modules:commercial:dfp:rendered', function (event) {
                        if (event.slot.getSlotElementId() === adId) {
                            resolve();
                        }
                    });
                });

                var getLatestAdHeight = function () {
                    return fastdom.read(function () {
                        var adSlotPadding = parseInt($('#' + adId, $adBanner).css('padding-bottom')) * 2;
                        // We must read the iframe attribute height to avoid reading the clientHeight mid-transition
                        var iframeHeightStr = $('iframe', $adBanner).attr('height');
                        var newAdHeight = Number(iframeHeightStr) + adSlotPadding;
                        return iframeHeightStr ? newAdHeight : oldAdHeight;
                    });
                };

                var render = function (firstRender) {
                    getLatestAdHeight().then(function (adHeight) {
                        var scrollY = window.scrollY;
                        fastdom.read(function () {
                            // Reset
                            $header.css('transition', '');
                            $adBanner.css('top', '');

                            if (scrollY > headerHeight) {
                                $adBanner.css({
                                    'position': 'absolute',
                                    'top': headerHeight + 'px'
                                });
                            } else {
                                $adBanner.css({ 'position': 'fixed' });
                            }

                            $header.css('margin-top', adHeight + 'px');
                            if (scrollY === 0 && !firstRender) {
                                $header.css('transition', 'margin-top 0.75s cubic-bezier(0, 0, 0, 0.985)');
                            }
                        });
                    });
                };

                //
                // Side effects
                //

                mediator.on('window:throttledScroll', render);
                render(true);
                topAdRenderedPromise.then(render);

                // Adjust the scroll position to compensate for the margin-top added to the header. This prevents the page moving around
                // This lives here because adjusting the scroll position only helps when the ad is already fixed and the animation doesn't scroll the main page
                topAdRenderedPromise
                    .then(getLatestAdHeight)
                    .then(function (newAdHeight) {
                        fastdom.read(function () {
                            var diff = newAdHeight - oldAdHeight;

                            if (window.scrollY !== 0) {
                                window.scrollTo(window.scrollX, window.scrollY + diff);
                            }
                        });
                    });
            });
        }
    };
});
