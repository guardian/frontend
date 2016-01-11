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

                var oldAdHeightPromise = Promise.resolve(oldAdHeight);
                var newAdHeightPromise = topAdRenderedPromise.then(function () {
                    return fastdom.read(function () {
                        var adSlotPadding = parseInt($('#' + adId, $adBanner).css('padding-bottom')) * 2;
                        // We must read the iframe attribute height to avoid reading the clientHeight mid-transition
                        return Number($('iframe', $adBanner).attr('height')) + adSlotPadding;
                    });
                });

                var getLatestAdHeight = function () {
                    return Promise.race([newAdHeightPromise, oldAdHeightPromise]);
                };

                var render = function () {
                    getLatestAdHeight().then(function (adHeight) {
                        fastdom.write(function () {
                            if (window.scrollY === 0) {
                                // Reset
                                $header.css('margin-top', '');
                                $adBanner.css({
                                    'position': '',
                                    'top': ''
                                });
                            } else {
                                if (window.scrollY > (headerHeight)) {
                                    $adBanner.css({
                                        'position': 'absolute',
                                        'top': headerHeight + 'px'
                                    });
                                } else {
                                    $adBanner.css({
                                        'position': 'fixed',
                                        'top': 0
                                    });
                                }
                                $header.css('margin-top', adHeight + 'px');
                            }
                        });
                    });
                };

                //
                // Side effects
                //

                mediator.on('window:throttledScroll', render);
                render();
                topAdRenderedPromise.then(render);

                // Adjust the scroll position to compensate for the margin-top added to the header. This prevents the page moving around
                // This lives here because adjusting the scroll position only helps when the ad is already fixed and the animation doesn't scroll the main page
                newAdHeightPromise.then(function (adHeight) {
                    var diff = adHeight - oldAdHeight;

                    if (window.scrollY !== 0) {
                        window.scrollTo(window.scrollX, window.scrollY + diff);
                    }
                });
            });
        }
    };
});
