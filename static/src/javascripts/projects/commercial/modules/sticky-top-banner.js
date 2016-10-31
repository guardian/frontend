define([
    'Promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/closest',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/track-ad-render',
    'commercial/modules/messenger',
    'commercial/modules/dfp/get-advert-by-id'
], function (
    Promise,
    config,
    detect,
    closest,
    fastdom,
    trackAdRender,
    messenger,
    getAdvertById
) {
    var topSlotId = 'dfp-ad--top-above-nav';
    var updateQueued = false;
    var win, header, headerHeight, topSlot, topSlotHeight, stickyBanner, scrollY;

    return {
        init: init,
        update: update,
        resize: resizeStickyBanner,
        onScroll: onScroll
    };

    function init(_window) {
        win = _window || window;
        if (detect.isBreakpoint({ min: 'desktop' })) {
            header = document.getElementById('header');
            topSlot = document.getElementById(topSlotId);
            stickyBanner = topSlot.parentNode;

            // First, let's assign some default values so that everything
            // is in good order before we start animating changes in height
            return initState()
            // Second, start listening for height and scroll changes
            .then(setupListeners)
            // Finally, start animating changes in height
            .then(setupAnimation);
        } else {
            return Promise.resolve();
        }
    }

    function initState() {
        return fastdom.read(function () {
            headerHeight = header.offsetHeight;
            return topSlot.offsetHeight;
        })
        .then(function (currentHeight) {
            return Promise.all([
                resizeStickyBanner(currentHeight),
                onScroll()
            ]);
        });
    }

    // The height of the top slot changes on 2 occasions:
    // 1. when the ad is rendered: the ad slot may be manipulated in many ways
    //    and its geomatry may change
    // 2. when the ad is dynamically resized: the creative may send a message
    //    at any point to signal a change of height. Rubicon ads use a legacy
    //    version of the message system for handling this
    //
    // We also listen for scroll events if we need to, to snap the slot in
    // place when it reaches the end of the header.
    function setupListeners() {
        messenger.register('set-ad-height', onRubiconResize);
        messenger.register('resize', onResize);
        if (!config.page.hasSuperStickyBanner) {
            win.addEventListener('scroll', onScroll);
        }

        // we don't want to animate *all* the changes in height, specifically
        // the ones happening when a custom creative is initially rendered;
        // that's why this promise must resolve before setupAnimation
        return trackAdRender(topSlotId).then(onTopAdRendered);
    }

    function setupAnimation() {
        fastdom.write(function () {
            header.classList.add('l-header--animate');
            stickyBanner.classList.add('sticky-top-banner-ad--animate');
        });
    }

    function onTopAdRendered() {
        fastdom.read(function () {
            return topSlot.offsetHeight;
        })
        .then(resizeStickyBanner);
    }

    function onRubiconResize(specs, _, iframe) {
        update(specs.height, closest(iframe, '.js-ad-slot'))
        .then(function (ret) {
            if( ret > -1 ) {
                messenger.unregister('set-ad-height', onRubiconResize);
            }
        });
    }

    function onResize(specs, _, iframe) {
        update(specs.height, closest(iframe, '.js-ad-slot'));
    }

    function update(newHeight, adSlot) {
        return adSlot.id === topSlotId ?
            fastdom.read(function () {
                var adStyles = win.getComputedStyle(adSlot);
                return parseInt(specs.height) + parseInt(adStyles.paddingTop) + parseInt(adStyles.paddingBottom);
            })
            .then(resizeStickyBanner) :
            Promise.resolve(-1);
    }

    function onScroll() {
        scrollY = win.pageYOffset;
        if (!updateQueued) {
            updateQueued = true;
            return fastdom.write(function () {
                updateQueued = false;
                if (scrollY > headerHeight ) {
                    stickyBanner.style.position = 'absolute';
                    stickyBanner.style.top = headerHeight + 'px';
                } else {
                    stickyBanner.style.position =
                    stickyBanner.style.top = null;
                }
            });
        }
    }

    function resizeStickyBanner(newHeight) {
        if (topSlotHeight !== newHeight) {
            topSlotHeight = newHeight;
            return fastdom.write(function () {
                stickyBanner.classList.add('sticky-top-banner-ad');
                stickyBanner.style.height =
                header.style.marginTop = newHeight + 'px';
                return newHeight;
            });
        } else {
            return Promise.resolve(-1);
        }
    }
});
