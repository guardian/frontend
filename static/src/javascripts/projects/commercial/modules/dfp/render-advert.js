// @flow

import qwery from 'qwery';
import reportError from 'lib/report-error';
import fastdom from 'lib/fastdom-promise';
import { Advert } from 'commercial/modules/dfp/Advert';
import { adSizes } from 'commercial/modules/ad-sizes';
import { stickyMpu, stickyCommentsMpu } from 'commercial/modules/sticky-mpu';
import { applyCreativeTemplate } from 'commercial/modules/dfp/apply-creative-template';
import { renderAdvertLabel } from 'commercial/modules/dfp/render-advert-label';
import { geoMostPopular } from 'common/modules/onward/geo-most-popular';
import type { SlotRenderEndedEvent } from 'commercial/types';
/**
 * ADVERT RENDERING
 * ----------------
 *
 * Most adverts come back from DFP ready to display as-is. But sometimes we need more: embedded components that can share
 * Guardian styles, for example, or behaviours like sticky-scrolling. This module helps 'finish' rendering any advert, and
 * decorates them with these behaviours.
 *
 */

const addClassIfHasClass = (newClassNames: Array<string>) =>
    function hasClass(classNames) {
        return function onAdvertRendered(_, advert) {
            if (
                classNames.some(className =>
                    advert.node.classList.contains(className)
                )
            ) {
                return fastdom.write(() => {
                    newClassNames.forEach(className => {
                        advert.node.classList.add(className);
                    });
                });
            }
            return Promise.resolve();
        };
    };

const addFluid250 = addClassIfHasClass(['ad-slot--fluid250']);
const addFluid = addClassIfHasClass(['ad-slot--fluid']);

const removeStyleFromAdIframe = (advert: Advert, style: string) => {
    const adIframe: ?HTMLElement = advert.node.querySelector('iframe');

    fastdom.write(() => {
        if (adIframe) {
            adIframe.style.removeProperty(style);
        }
    });
};

const sizeCallbacks: { [string]: (any, any) => Promise<void> } = {};

/**
 * DFP fluid ads should use existing fluid-250 styles in the top banner position
 * The vertical-align property found on DFP iframes affects the smoothness of
 * CSS transitions when expanding/collapsing various native style formats.
 */
sizeCallbacks[adSizes.fluid] = (renderSlotEvent: any, advert: Advert) =>
    addFluid(['ad-slot'])(renderSlotEvent, advert).then(() =>
        removeStyleFromAdIframe(advert, 'vertical-align')
    );

/**
 * Trigger sticky scrolling for MPUs in the right-hand article column
 */
sizeCallbacks[adSizes.mpu] = (_, advert) =>
    fastdom.read(() => {
        if (advert.node.classList.contains('js-sticky-mpu')) {
            if (advert.node.classList.contains('ad-slot--right')) {
                stickyMpu(advert.node);
            }
            if (advert.node.classList.contains('ad-slot--comments')) {
                stickyCommentsMpu(advert.node);
            }
        }
        return fastdom.write(() => advert.updateExtraSlotClasses());
    });

/**
 * Resolve the stickyMpu.whenRendered promise
 */
sizeCallbacks[adSizes.halfPage] = (_, advert) =>
    fastdom.read(() => {
        if (advert.node.classList.contains('ad-slot--right')) {
            stickyMpu(advert.node);
        }
        if (advert.node.classList.contains('ad-slot--comments')) {
            stickyCommentsMpu(advert.node);
        }
        return fastdom.write(() => advert.updateExtraSlotClasses());
    });

sizeCallbacks[adSizes.skyscraper] = (_, advert) =>
    fastdom.read(() => {
        if (advert.node.classList.contains('ad-slot--right')) {
            stickyMpu(advert.node);
        }
        if (advert.node.classList.contains('ad-slot--comments')) {
            stickyCommentsMpu(advert.node);
        }
        return fastdom.write(() =>
            advert.updateExtraSlotClasses('ad-slot--sky')
        );
    });

sizeCallbacks[adSizes.video] = (_, advert) =>
    fastdom.write(() => {
        advert.updateExtraSlotClasses('u-h');
    });

sizeCallbacks[adSizes.outstreamDesktop] = (_, advert) =>
    fastdom.write(() => {
        advert.updateExtraSlotClasses('ad-slot--outstream');
    });

sizeCallbacks[adSizes.outstreamMobile] = (_, advert) =>
    fastdom.write(() => {
        advert.updateExtraSlotClasses('ad-slot--outstream');
    });

sizeCallbacks[adSizes.googleCard] = (_, advert) =>
    fastdom.write(() => {
        advert.updateExtraSlotClasses('ad-slot--gc');
    });

/**
 * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
 * and their containers closed up.
 */
const outOfPageCallback = (event, advert) => {
    if (!event.slot.getOutOfPage()) {
        const parent = advert.node.parentNode;
        return fastdom.write(() => {
            advert.node.classList.add('u-h');
            // if in a slice, add the 'no mpu' class
            if (parent.classList.contains('fc-slice__item--mpu-candidate')) {
                parent.classList.add('fc-slice__item--no-mpu');
            }
        });
    }
    return Promise.resolve();
};
sizeCallbacks[adSizes.outOfPage] = outOfPageCallback;
sizeCallbacks[adSizes.empty] = outOfPageCallback;

/**
 * Portrait adverts exclude the locally-most-popular widget
 */
sizeCallbacks[adSizes.portrait] = () =>
    // remove geo most popular
    geoMostPopular.whenRendered.then(popular =>
        fastdom.write(() => {
            if (popular && popular.elem) {
                popular.elem.remove();
                popular.elem = null;
            }
        })
    );

/**
 * Commercial components with merch sizing get fluid-250 styling
 */
sizeCallbacks[adSizes.merchandising] = addFluid250([
    'ad-slot--commercial-component',
]);

const addContentClass = adSlotNode => {
    const adSlotContent = qwery('> div:not(.ad-slot__label)', adSlotNode);

    if (adSlotContent.length) {
        fastdom.write(() => {
            adSlotContent[0].classList.add('ad-slot__content');
        });
    }
};

/**
 * @param advert - as defined in commercial/modules/dfp/Advert
 * @param slotRenderEndedEvent - GPT slotRenderEndedEvent
 * @returns {Promise} - resolves once all necessary rendering is queued up
 */
export const renderAdvert = (
    advert: Advert,
    slotRenderEndedEvent: SlotRenderEndedEvent
): Promise<boolean> => {
    addContentClass(advert.node);

    return applyCreativeTemplate(advert.node)
        .then(isRendered => {
            const callSizeCallback = () => {
                if (advert.size) {
                    let size = advert.size.toString();

                    if (size === '0,0') {
                        size = 'fluid';
                    }

                    /**
                     * we reset hasPrebidSize to the default
                     * value of false for subsequent ad refreshes
                     * as they may not be prebid ads.
                     * */
                    advert.hasPrebidSize = false;

                    return Promise.resolve(
                        sizeCallbacks[size]
                            ? sizeCallbacks[size](slotRenderEndedEvent, advert)
                            : fastdom.write(() => {
                                  advert.updateExtraSlotClasses();
                              })
                    );
                }
                return Promise.resolve(null);
            };

            const addRenderedClass = () =>
                isRendered
                    ? fastdom.write(() => {
                          advert.node.classList.add('ad-slot--rendered');
                      })
                    : Promise.resolve();

            return callSizeCallback()
                .then(() => renderAdvertLabel(advert.node))
                .then(addRenderedClass)
                .then(() => isRendered);
        })
        .catch(err => {
            reportError(
                err,
                {
                    feature: 'commercial',
                },
                false
            );

            return Promise.resolve(false);
        });
};
