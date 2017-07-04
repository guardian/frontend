// @flow

import qwery from 'qwery';
import raven from 'lib/raven';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { Advert } from 'commercial/modules/dfp/Advert';
import adSizes from 'commercial/modules/ad-sizes';
import stickyMpu from 'commercial/modules/sticky-mpu';
import { applyCreativeTemplate } from 'commercial/modules/dfp/apply-creative-template';
import renderAdvertLabel from 'commercial/modules/dfp/render-advert-label';
import { geoMostPopular } from 'common/modules/onward/geo-most-popular';
import { Toggles } from 'common/modules/ui/toggles';
import { recordUserAdFeedback } from 'commercial/modules/user-ad-feedback';
import config from 'lib/config';
/**
 * ADVERT RENDERING
 * ----------------
 *
 * Most adverts come back from DFP ready to display as-is. But sometimes we need more: embedded components that can share
 * Guardian styles, for example, or behaviours like sticky-scrolling. This module helps 'finish' rendering any advert, and
 * decorates them with these behaviours.
 *
 */

const addClassIfHasClass = newClassNames =>
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
        };
    };

const addFluid250 = addClassIfHasClass(['ad-slot--fluid250']);
const addFluid = addClassIfHasClass(['ad-slot--fluid']);

const sizeCallbacks = {};

/**
 * DFP fluid ads should use existing fluid-250 styles in the top banner position
 */
sizeCallbacks[adSizes.fluid] = addFluid(['ad-slot']);

/**
 * Trigger sticky scrolling for MPUs in the right-hand article column
 */
sizeCallbacks[adSizes.mpu] = (_, advert) => {
    if (advert.node.classList.contains('js-sticky-mpu')) {
        stickyMpu(advert.node);
    } else {
        return addFluid(['ad-slot--revealer'])(_, advert);
    }
};

/**
 * Resolve the stickyMpu.whenRendered promise
 */
sizeCallbacks[adSizes.halfPage] = () => {
    mediator.emit('page:commercial:sticky-mpu');
};

if (config.switches.keepVideoAdSlotsOpen) {
    sizeCallbacks[adSizes.video] = (_, advert) => {
        fastdom.write(() => {
            advert.node.classList.add('u-h');
        });
    };
}

sizeCallbacks[adSizes.video2] = (_, advert) => {
    fastdom.write(() => {
        advert.node.classList.add('ad-slot--outstream');
    });
};

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
};
sizeCallbacks[adSizes.outOfPage] = outOfPageCallback;
sizeCallbacks[adSizes.empty] = outOfPageCallback;

/**
 * Portrait adverts exclude the locally-most-popular widget
 */
sizeCallbacks[adSizes.portrait] = () => {
    // remove geo most popular
    geoMostPopular.whenRendered.then(popular =>
        fastdom.write(() => {
            popular.elem.remove();
            popular.elem = null;
        })
    );
};

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
 * @param slotRenderEvent - GPT slotRenderEndedEvent
 * @returns {Promise} - resolves once all necessary rendering is queued up
 */
const renderAdvert = (advert: Advert, slotRenderEvent: any) => {
    addContentClass(advert.node);

    return applyCreativeTemplate(advert.node)
        .then(isRendered => {
            const callSizeCallback = () => {
                if (advert.size) {
                    let size = advert.size.toString();
                    if (size === '0,0') {
                        size = 'fluid';
                    }

                    return Promise.resolve(
                        sizeCallbacks[size]
                            ? sizeCallbacks[size](slotRenderEvent, advert)
                            : null
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

            const addFeedbackDropdownToggle = () =>
                config.switches.adFeedback && isRendered
                    ? fastdom.write(() => {
                          if (
                              !advert.node.classList.contains('js-toggle-ready')
                          ) {
                              const toggles = new Toggles(advert.node);
                              toggles.init();
                          }
                      })
                    : Promise.resolve();

            const applyFeedbackOnClickListeners = slotRender => {
                const readyClass = 'js-onclick-ready';
                return config.switches.adFeedback && isRendered
                    ? fastdom.write(() => {
                          qwery(
                              '.js-ad-feedback-option:not(.js-onclick-ready)'
                          ).forEach(el => {
                              const slotId = el.getAttribute('data-slot');
                              const problem = el.getAttribute('data-problem');
                              el.addEventListener('click', () => {
                                  recordUserAdFeedback(
                                      window.location.pathname,
                                      slotId,
                                      slotRender,
                                      problem
                                  );
                              });
                              el.classList.add(readyClass);
                          });
                      })
                    : Promise.resolve();
            };

            return callSizeCallback()
                .then(() => renderAdvertLabel(advert.node))
                .then(addFeedbackDropdownToggle)
                .then(() => applyFeedbackOnClickListeners(slotRenderEvent))
                .then(addRenderedClass)
                .then(() => isRendered);
        })
        .catch(raven.captureException);
};

export default renderAdvert;
