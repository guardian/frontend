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

                var previousAdHeight = oldAdHeight;
                var render = function (options) {
                    var firstRender = options && options.firstRender;
                    getLatestAdHeight().then(function (adHeight) {
                        fastdom.read(function () {
                            var scrollY = window.scrollY;
                            var scrollX = window.scrollX;

                            fastdom.write(function () {
                                // Reset
                                $header.css('transition', '');
                                $adBanner.css('top', '');

                                // Set
                                if (scrollY > headerHeight) {
                                    $adBanner.css({
                                        'position': 'absolute',
                                        'top': headerHeight + 'px'
                                    });
                                } else {
                                    $adBanner.css({ 'position': 'fixed' });
                                }

                                $header.css('margin-top', adHeight + 'px');

                                var scrollIsAtTop = scrollY === 0;
                                // Avoid an initial transition when we apply the margin top for the first time
                                if (scrollIsAtTop && !firstRender) {
                                    // If the user is at the top of the page, we want to transition
                                    // the change
                                    $header.css('transition', 'margin-top 0.75s cubic-bezier(0, 0, 0, 0.985)');
                                } else {
                                    // If the user is not at the top, we want to offset their scroll position
                                    var diff = adHeight - previousAdHeight;
                                    if (diff > 0) {
                                        window.scrollTo(scrollX, scrollY + diff);
                                    }
                                }

                                previousAdHeight = adHeight;
                            });
                        });
                    });
                };

                //
                // Side effects
                //

                mediator.on('window:throttledScroll', render);
                render({ firstRender: true });
                topAdRenderedPromise.then(render);
            });
        }
    };
});
