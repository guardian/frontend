// @flow
import { addEventListener } from 'lib/events';
import config from 'lib/config';
import detect from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { register, unregister } from 'commercial/modules/messenger';

const topSlotId = 'dfp-ad--top-above-nav';
let updateQueued = false;
let win;
let header;
let headerHeight;
let topSlot;
let topSlotHeight;
let topSlotStyles;
let stickyBanner;
let scrollY;

// Because the top banner is not in the document flow, resizing it requires
// that we also make space for it. This is done by adjusting the top margin
// of the header.
// This is also the best place to adjust the scrolling position in case the
// user has scrolled past the header.
const resizeStickyBanner = newHeight => {
    if (topSlotHeight !== newHeight) {
        return fastdom.write(() => {
            stickyBanner.classList.add('sticky-top-banner-ad');
            // eslint-disable-next-line no-multi-assign
            stickyBanner.style.height = header.style.marginTop = `${newHeight}px`;

            if (topSlotHeight !== undefined && headerHeight <= scrollY) {
                win.scrollBy(0, newHeight - topSlotHeight);
            }

            topSlotHeight = newHeight;
            return newHeight;
        });
    }
    return Promise.resolve(-1);
};

// Sudden changes in the layout can be jarring to the user, so we animate
// them for a better experience. We only do this if the slot is in view
// though.
const setupAnimation = () =>
    fastdom.write(() => {
        if (scrollY <= headerHeight) {
            header.classList.add('l-header--animate');
            stickyBanner.classList.add('sticky-top-banner-ad--animate');
        } else {
            header.classList.remove('l-header--animate');
            stickyBanner.classList.remove('sticky-top-banner-ad--animate');
        }
    });

const onScroll = () => {
    scrollY = win.pageYOffset;
    if (!updateQueued) {
        updateQueued = true;
        return fastdom
            .write(() => {
                updateQueued = false;
                if (headerHeight < scrollY) {
                    stickyBanner.style.position = 'absolute';
                    stickyBanner.style.top = `${headerHeight}px`;
                } else {
                    // eslint-disable-next-line no-multi-assign
                    stickyBanner.style.position = stickyBanner.style.top = null;
                }
            })
            .then(setupAnimation);
    }
};

const initState = () =>
    fastdom
        .read(() => {
            headerHeight = header.offsetHeight;
            return topSlot.offsetHeight;
        })
        .then(currentHeight =>
            Promise.all([resizeStickyBanner(currentHeight), onScroll()])
        );

const update = newHeight =>
    fastdom
        .read(() => {
            topSlotStyles = topSlotStyles || win.getComputedStyle(topSlot);
            return (
                newHeight +
                parseInt(topSlotStyles.paddingTop, 10) +
                parseInt(topSlotStyles.paddingBottom, 10)
            );
        })
        .then(resizeStickyBanner);

const onResize = (specs, _, iframe) => {
    if (topSlot.contains(iframe)) {
        update(specs.height);
        unregister('resize', onResize);
    }
};

// Register a message listener for when the creative wants to resize
// its container
// We also listen for scroll events if we need to, to snap the slot in
// place when it reaches the end of the header.
const setupListeners = () => {
    register('resize', onResize);
    if (!config.page.hasSuperStickyBanner) {
        addEventListener(win, 'scroll', onScroll, {
            passive: true,
        });
    }
};

const onFirstRender = () => {
    trackAdRender(topSlotId).then(isRendered => {
        if (isRendered) {
            const advert = getAdvertById(topSlotId);
            if (
                advert &&
                advert.size &&
                // skip for Fabric creatives
                advert.size[0] !== 88 &&
                // skip for native ads
                advert.size[1] > 0
            ) {
                fastdom
                    .read(() => {
                        const styles = window.getComputedStyle(topSlot);
                        return (
                            parseInt(styles.paddingTop, 10) +
                            parseInt(styles.paddingBottom, 10) +
                            advert.size[1]
                        );
                    })
                    .then(resizeStickyBanner);
            } else {
                fastdom
                    .read(() => topSlot.offsetHeight)
                    .then(resizeStickyBanner);
            }
        }
    });
};

const init = _window => {
    if (!commercialFeatures.stickyTopBannerAd) {
        return Promise.resolve();
    }

    win = _window || window;
    topSlot = document.getElementById(topSlotId);
    if (
        topSlot &&
        detect.isBreakpoint({
            min: 'desktop',
        })
    ) {
        header = document.getElementById('header');
        stickyBanner = topSlot.parentNode;

        // First, let's assign some default values so that everything
        // is in good order before we start animating changes in height
        return (
            initState()
                // Second, start listening for height and scroll changes
                .then(setupListeners)
                .then(onFirstRender)
        );
    }
    topSlot = null;
    return Promise.resolve();
};

export default {
    init,
    update,
    resize: resizeStickyBanner,
    onScroll,
};
