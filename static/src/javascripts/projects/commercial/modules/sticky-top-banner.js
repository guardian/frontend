import events from 'lib/events';
import config from 'lib/config';
import detect from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import commercialFeatures from 'commercial/modules/commercial-features';
import getAdvertById from 'commercial/modules/dfp/get-advert-by-id';
import messenger from 'commercial/modules/messenger';
var topSlotId = 'dfp-ad--top-above-nav';
var updateQueued = false;
var win, header, headerHeight, topSlot, topSlotHeight, topSlotStyles, stickyBanner, scrollY;

export default {
    init: init,
    update: update,
    resize: resizeStickyBanner,
    onScroll: onScroll
};

function init(_window) {
    if (!commercialFeatures.commercialFeatures.stickyTopBannerAd) {
        return Promise.resolve();
    }

    win = _window || window;
    topSlot = document.getElementById(topSlotId);
    if (topSlot && detect.isBreakpoint({
            min: 'desktop'
        })) {
        header = document.getElementById('header');
        stickyBanner = topSlot.parentNode;

        // First, let's assign some default values so that everything
        // is in good order before we start animating changes in height
        return initState()
            // Second, start listening for height and scroll changes
            .then(setupListeners)
            .then(onFirstRender);
    } else {
        topSlot = null;
        return Promise.resolve();
    }
}

function initState() {
    return fastdom.read(function() {
            headerHeight = header.offsetHeight;
            return topSlot.offsetHeight;
        })
        .then(function(currentHeight) {
            return Promise.all([
                resizeStickyBanner(currentHeight),
                onScroll()
            ]);
        });
}

// Register a message listener for when the creative wants to resize
// its container
// We also listen for scroll events if we need to, to snap the slot in
// place when it reaches the end of the header.
function setupListeners() {
    messenger.register('resize', onResize);
    if (!config.page.hasSuperStickyBanner) {
        events.addEventListener(win, 'scroll', onScroll, {
            passive: true
        });
    }
}

function onFirstRender() {
    trackAdRender(topSlotId)
        .then(function(isRendered) {
            if (isRendered) {
                var advert = getAdvertById.getAdvertById(topSlotId);
                if (advert &&
                    advert.size &&
                    // skip for Fabric creatives
                    advert.size[0] !== 88 &&
                    // skip for native ads
                    advert.size[1] > 0
                ) {
                    fastdom.read(function() {
                            var styles = window.getComputedStyle(topSlot);
                            return parseInt(styles.paddingTop) + parseInt(styles.paddingBottom) + advert.size[1];
                        })
                        .then(resizeStickyBanner);
                } else {
                    fastdom.read(function() {
                            return topSlot.offsetHeight;
                        })
                        .then(resizeStickyBanner);
                }
            }
        });
}

function onResize(specs, _, iframe) {
    if (topSlot.contains(iframe)) {
        update(specs.height);
        messenger.unregister('resize', onResize);
    }
}

function update(newHeight) {
    return fastdom.read(function() {
            topSlotStyles || (topSlotStyles = win.getComputedStyle(topSlot));
            return newHeight + parseInt(topSlotStyles.paddingTop) + parseInt(topSlotStyles.paddingBottom);
        })
        .then(resizeStickyBanner);
}

function onScroll() {
    scrollY = win.pageYOffset;
    if (!updateQueued) {
        updateQueued = true;
        return fastdom.write(function() {
                updateQueued = false;
                if (headerHeight < scrollY) {
                    stickyBanner.style.position = 'absolute';
                    stickyBanner.style.top = headerHeight + 'px';
                } else {
                    stickyBanner.style.position =
                        stickyBanner.style.top = null;
                }
            })
            .then(setupAnimation);
    }
}

// Sudden changes in the layout can be jarring to the user, so we animate
// them for a better experience. We only do this if the slot is in view
// though.
function setupAnimation() {
    return fastdom.write(function() {
        if (scrollY <= headerHeight) {
            header.classList.add('l-header--animate');
            stickyBanner.classList.add('sticky-top-banner-ad--animate');
        } else {
            header.classList.remove('l-header--animate');
            stickyBanner.classList.remove('sticky-top-banner-ad--animate');
        }
    });
}

// Because the top banner is not in the document flow, resizing it requires
// that we also make space for it. This is done by adjusting the top margin
// of the header.
// This is also the best place to adjust the scrolling position in case the
// user has scrolled past the header.
function resizeStickyBanner(newHeight) {
    if (topSlotHeight !== newHeight) {
        return fastdom.write(function() {
            stickyBanner.classList.add('sticky-top-banner-ad');
            stickyBanner.style.height =
                header.style.marginTop = newHeight + 'px';

            if (topSlotHeight !== undefined && headerHeight <= scrollY) {
                win.scrollBy(0, newHeight - topSlotHeight);
            }

            topSlotHeight = newHeight;
            return newHeight;
        });
    } else {
        return Promise.resolve(-1);
    }
}
