define([
    'bonzo',
    'qwery',
    'raven',
    'Promise',
    'common/utils/fastdom-promise',
    'common/modules/commercial/ad-sizes',
    'common/modules/commercial/ads/sticky-mpu',
    'common/modules/commercial/dfp/private/apply-creative-template',
    'common/modules/commercial/dfp/private/render-advert-label',
    'common/modules/onward/geo-most-popular'
], function (
    bonzo,
    qwery,
    raven,
    Promise,
    fastdom,
    adSizes,
    stickyMpu,
    applyCreativeTemplate,
    renderAdvertLabel,
    geoMostPopular
) {
    /**
     * ADVERT RENDERING
     * ----------------
     *
     * Most adverts come back from DFP ready to display as-is. But sometimes we need more: embedded components that can share
     * Guardian styles, for example, or behaviours like sticky-scrolling. This module helps 'finish' rendering any advert, and
     * decorates them with these behaviours.
     *
     */

    function addClassIfHasClass(newClassNames) {
        return function hasClass(classNames) {
            return function onAdvertRendered(_, advert) {
                var $node = bonzo(advert.node);
                if (classNames.some($node.hasClass.bind($node))) {
                    return fastdom.write(function () {
                        newClassNames.forEach($node.addClass.bind($node));
                    });
                }
            };
        };
    }

    var addFluid250 = addClassIfHasClass(['ad-slot--fluid250']);
    var addFluid    = addClassIfHasClass(['ad-slot--fluid']);

    var sizeCallbacks = {};

    /**
     * DFP fluid ads should use existing fluid-250 styles in the top banner position
     */
    sizeCallbacks[adSizes.fluid] = addFluid250(['ad-slot--top-banner-ad']);

    /**
     * Trigger sticky scrolling for MPUs in the right-hand article column
     */
    sizeCallbacks[adSizes.mpu] = function (_, advert) {
        var $node = bonzo(advert.node);
        if ($node.hasClass('ad-slot--right')) {
            stickyMpu($node);
        } else {
            return addFluid(['ad-slot--facebook'])(_, advert);
        }
    };

    /**
     * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
     * and their containers closed up.
     */
    sizeCallbacks[adSizes.outOfPage] = function (event, advert) {
        if (!event.slot.getOutOfPage()) {
            var $parent = bonzo(advert.node.parentNode);
            return fastdom.write(function () {
                bonzo(advert.node).addClass('u-h');
                // if in a slice, add the 'no mpu' class
                if ($parent.hasClass('js-fc-slice-mpu-candidate')) {
                    $parent.addClass('fc-slice__item--no-mpu');
                }
            });
        }
    };

    /**
     * Portrait adverts exclude the locally-most-popular widget
     */
    sizeCallbacks[adSizes.portrait] = function () {
        // remove geo most popular
        geoMostPopular.whenRendered.then(function (geoMostPopular) {
            return fastdom.write(function () {
                bonzo(geoMostPopular.elem).remove();
            });
        });
    };

    /**
     * Top banner ads with fluid250 size get special styling
     */
    sizeCallbacks[adSizes.fluid250] = addFluid250(['ad-slot--top-banner-ad']);

    /**
     * Mobile adverts with fabric sizes get 'fluid' full-width design
     */
    sizeCallbacks[adSizes.fabric] = addFluid(['ad-slot--mobile', 'ad-slot--top-banner-ad']);

    /**
     * Commercial components with merch sizing get fluid-250 styling
     */
    sizeCallbacks[adSizes.merchandising] = addFluid250(['ad-slot--commercial-component']);

    /**
     * @param adSlotId - DOM ID of the rendered slot
     * @param slotRenderEvent - GPT slotRenderEndedEvent
     * @returns {Promise} - resolves once all necessary rendering is queued up
     */
    function renderAdvert(advert, slotRenderEvent) {
        removePlaceholders(advert.node);

        return applyCreativeTemplate(advert.node).then(function (isRendered) {
            return renderAdvertLabel(advert.node)
                .then(callSizeCallback)
                .then(addRenderedClass)
                .then(function () {
                    return isRendered;
                });

            function callSizeCallback() {
                var size = slotRenderEvent.size.join(',');
                if (sizeCallbacks[size]) {
                    return sizeCallbacks[size](slotRenderEvent, advert);
                }
            }

            function addRenderedClass() {
                return isRendered ? fastdom.write(function () {
                    bonzo(advert.node).addClass('ad-slot--rendered');
                }) : Promise.resolve();
            }
        }).catch(raven.captureException);
    }

    function removePlaceholders(adSlotNode) {
        var placeholder = qwery('.ad-slot__content--placeholder', adSlotNode);
        var adSlotContent = qwery('div', adSlotNode);

        if (adSlotContent.length) {
            fastdom.write(function () {
                bonzo(placeholder).remove();
                bonzo(adSlotContent).addClass('ad-slot__content');
            });
        }
    }

    return renderAdvert;

});
