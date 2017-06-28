// @flow
import type { Advert } from 'commercial/modules/dfp/Advert';

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
let header: ?HTMLElement;
let headerHeight;
let topSlot: ?HTMLElement;
let topSlotHeight;
let topSlotStyles;
let stickyBanner: ?HTMLElement;
let scrollY;

// Because the top banner is not in the document flow, resizing it requires
// that we also make space for it. This is done by adjusting the top margin
// of the header.
// This is also the best place to adjust the scrolling position in case the
// user has scrolled past the header.
const resizeStickyBanner = (newHeight: number): Promise<number> => {
    if (topSlotHeight !== newHeight) {
        return fastdom.write(() => {
            if (stickyBanner && header) {
                stickyBanner.classList.add('sticky-top-banner-ad');
                stickyBanner.style.height = `${newHeight}px`;
                header.style.marginTop = `${newHeight}px`;
            }
            if (topSlotHeight !== undefined && headerHeight <= scrollY) {
                window.scrollBy(0, newHeight - topSlotHeight);
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
const setupAnimation = (): Promise<any> =>
    fastdom.write(() => {
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

const onScroll = (): ?Promise<any> => {
    scrollY = window.pageYOffset;
    if (!updateQueued) {
        updateQueued = true;

        return fastdom
            .write(() => {
                updateQueued = false;
                if (stickyBanner) {
                    if (headerHeight < scrollY) {
                        stickyBanner.style.position = 'absolute';
                        stickyBanner.style.top = `${headerHeight}px`;
                    } else {
                        stickyBanner.style.position = 'static';
                        stickyBanner.style.top = 'auto';
                    }
                }
            })
            .then(setupAnimation);
    }
};

const update = (newHeight: number): Promise<any> =>
    fastdom
        .read(() => {
            topSlotStyles = topSlotStyles || window.getComputedStyle(topSlot);
            return (
                newHeight +
                parseInt(topSlotStyles.paddingTop, 10) +
                parseInt(topSlotStyles.paddingBottom, 10)
            );
        })
        .then(resizeStickyBanner);

// TODO: what are we expecting these parameters to be?
const onResize = (specs: any, _: any, iframe: any): void => {
    if (topSlot && topSlot.contains(iframe)) {
        update(specs.height);
        unregister('resize', onResize);
    }
};

// Register a message listener for when the creative wants to resize
// its container
// We also listen for scroll events if we need to, to snap the slot in
// place when it reaches the end of the header.
const setupListeners = (): void => {
    register('resize', onResize);
    if (!config.page.hasSuperStickyBanner) {
        addEventListener(win, 'scroll', onScroll, {
            passive: true,
        });
    }
};

const getAdvertSizeByIndex = (advert: ?Advert, index: number): ?number => {
    if (advert && advert.size && typeof advert.size !== 'string') {
        return advert.size[index];
    }
};

const onFirstRender = (): Promise<any> =>
    trackAdRender(topSlotId).then(isRendered => {
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
                    .read(() => {
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
                .read(() => {
                    if (topSlot) {
                        return topSlot.offsetHeight;
                    }

                    return 0;
                })
                .then(resizeStickyBanner);
        }
    });

const initState = (): Promise<any> =>
    fastdom
        .read(() => {
            if (header) {
                headerHeight =
                    parseInt(window.getComputedStyle(header).height, 10) || 0;
            }
            if (topSlot) {
                return (
                    parseInt(window.getComputedStyle(topSlot).height, 10) || 0
                );
            }

            return 0;
        })
        .then(currentHeight =>
            Promise.all([resizeStickyBanner(currentHeight), onScroll()])
        );

// TODO: is it really necessary to inject a mock window here?
const initStickyTopBanner = (_window: any): Promise<void> => {
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
        stickyBanner = ((topSlot.parentNode: any): HTMLElement);

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

export { initStickyTopBanner, update, resizeStickyBanner as resize, onScroll };
