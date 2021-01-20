import { addEventListener } from 'lib/events';
import { isBreakpoint } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { register, unregister } from 'commercial/modules/messenger';

const topSlotId = 'dfp-ad--top-above-nav';
let updateQueued = false;
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
const resizeStickyBanner = (newHeight) => {
    if (topSlotHeight === newHeight) {
        return Promise.resolve(-1);
    }

    return fastdom.mutate(() => {
        if (stickyBanner && header) {
            const newCSSHeight = `${newHeight}px`;
            stickyBanner.classList.add('sticky-top-banner-ad');
            stickyBanner.style.height = newCSSHeight;
            header.style.marginTop = newCSSHeight;
        }
        if (topSlotHeight !== undefined && headerHeight <= scrollY) {
            window.scrollBy(0, newHeight - topSlotHeight);
        }
        topSlotHeight = newHeight;

        return newHeight;
    });
};

// Sudden changes in the layout can be jarring to the user, so we animate
// them for a better experience. We only do this if the slot is in view
// though.
const setupAnimation = () =>
    fastdom.mutate(() => {
        if (stickyBanner && header) {
            if (scrollY <= headerHeight) {
                header.classList.add('l-header--animate');
                stickyBanner.classList.add('sticky-top-banner-ad--animate');
            } else {
                header.classList.remove('l-header--animate');
                stickyBanner.classList.remove('sticky-top-banner-ad--animate');
            }
        }
    });

const onScroll = () => {
    scrollY = window.pageYOffset;
    if (!updateQueued) {
        updateQueued = true;

        return fastdom
            .mutate(() => {
                updateQueued = false;
                if (stickyBanner) {
                    if (headerHeight < scrollY) {
                        stickyBanner.style.position = 'absolute';
                        stickyBanner.style.top = `${headerHeight}px`;
                    } else {
                        stickyBanner.style.position = '';
                        stickyBanner.style.top = '';
                    }
                }
            })
            .then(setupAnimation);
    }

    return Promise.resolve();
};

const update = (newHeight) =>
    fastdom
        .measure(() => {
            topSlotStyles = topSlotStyles || window.getComputedStyle(topSlot);
            return (
                newHeight +
                parseInt(topSlotStyles.paddingTop, 10) +
                parseInt(topSlotStyles.paddingBottom, 10)
            );
        })
        .then(resizeStickyBanner);

const onResize = (specs, _, iframe) => {
    if (topSlot && topSlot.contains(iframe)) {
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
    addEventListener(window, 'scroll', onScroll, {
        passive: true,
    });
};

const getAdvertSizeByIndex = (advert, index) => {
    if (advert && advert.size && typeof advert.size !== 'string') {
        return advert.size[index];
    }
};

const onFirstRender = () => {
    /* eslint-disable no-use-before-define */
    
    _.whenFirstRendered = trackAdRender(topSlotId).then(isRendered => {
        if (isRendered) {
            const advert = getAdvertById(topSlotId);
            const adSize0 = getAdvertSizeByIndex(advert, 0);
            const adSize1 = getAdvertSizeByIndex(advert, 1);

            if (
                // skip for Fabric creatives
                adSize0 !== 88 &&
                // skip for native ads
                adSize1 &&
                adSize1 > 0
            ) {
                return fastdom
                    .measure(() => {
                        const styles = window.getComputedStyle(topSlot);

                        return (
                            parseInt(styles.paddingTop, 10) +
                                parseInt(styles.paddingBottom, 10) +
                                adSize1 || 0
                        );
                    })
                    .then(resizeStickyBanner);
            }
            return fastdom
                .measure(
                    () =>
                        (topSlot && topSlot.getBoundingClientRect().height) || 0
                )
                .then(resizeStickyBanner);
        }
    });
    /* eslint-enable no-use-before-define */
};

const initState = () =>
    fastdom
        .measure(() => {
            if (header) {
                headerHeight = header.getBoundingClientRect().height;
            }

            return (topSlot && topSlot.getBoundingClientRect().height) || 0;
        })
        .then(currentHeight =>
            Promise.all([resizeStickyBanner(currentHeight), onScroll()])
        );

const init = () => {
    if (!commercialFeatures.stickyTopBannerAd) {
        return Promise.resolve();
    }

    topSlot = document.getElementById(topSlotId);
    if (
        topSlot &&
        isBreakpoint({
            min: 'desktop',
        })
    ) {
        header = document.getElementById('header');
        stickyBanner = (topSlot.parentNode);

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

export const _ = {
    update,
    resizeStickyBanner,
    onScroll,
    whenFirstRendered: null,
};
export { init };
