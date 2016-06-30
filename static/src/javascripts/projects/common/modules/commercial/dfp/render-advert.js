define([
    'bonzo',
    'qwery',
    'raven',
    'Promise',
    'common/utils/fastdom-promise',
    'common/modules/commercial/ad-sizes',
    'common/modules/commercial/ads/sticky-mpu',
    'common/modules/commercial/dfp/apply-creative-template',
    'common/modules/commercial/dfp/render-advert-label',
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

    var sizeCallbacks = {};

    /**
     * DFP fluid ads should use existing fluid-250 styles in the top banner position
     */
    sizeCallbacks[adSizes.fluid] = isFluid250('ad-slot--top-banner-ad');

    /**
     * Trigger sticky scrolling if the ad has the magic 'sticky' size
     */
    sizeCallbacks[adSizes.stickyMpu] = function (_, advert) {
        stickyMpu(bonzo(advert.node));
    };

    /**
     * Trigger sticky scrolling for MPUs in the right-hand article column
     */
    sizeCallbacks[adSizes.mpu] = function (_, advert) {
        if (advert.node.classList.contains('ad-slot--right')) {
            var mobileAdSizes = advert.sizes.mobile;
            if (mobileAdSizes && mobileAdSizes.some(function (size) { return size[0] === 300 && size[1] === 251; })) {
                stickyMpu(bonzo(advert.node));
            }
        } else if (advert.node.classList.contains('ad-slot--facebook')) {
            advert.node.classList.add('ad-slot--fluid');
        }
    };

    /**
     * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
     * and their containers closed up.
     */
    sizeCallbacks[adSizes.outOfPage] = function (event, advert) {
        if (!event.slot.getOutOfPage()) {
            advert.node.classList.add('u-h');
            var parent = advert.node.parentNode;
            // if in a slice, add the 'no mpu' class
            if (parent.classList.contains('js-fc-slice-mpu-candidate')) {
                parent.classList.add('fc-slice__item--no-mpu');
            }
        }
    };

    /**
     * Portrait adverts exclude the locally-most-popular widget
     */
    sizeCallbacks[adSizes.portrait] = function () {
        // remove geo most popular
        geoMostPopular.whenRendered.then(function (geoMostPopular) {
            fastdom.write(function () {
                bonzo(geoMostPopular.elem).remove();
            });
        });
    };

    /**
     * Top banner ads with fluid250 size get special styling
     */
    sizeCallbacks[adSizes.fluid250] = isFluid250('ad-slot--top-banner-ad');

    /**
     * Mobile adverts with fabric sizes get 'fluid' full-width design
     */
    sizeCallbacks[adSizes.fabric] = isFluid('ad-slot--mobile');

    /**
     * Commercial components with merch sizing get fluid-250 styling
     */
    sizeCallbacks[adSizes.merchandising] = isFluid250('ad-slot--commercial-component');

    function isFluid250(className) {
        return function (_, advert) {
            if (advert.node.classList.contains(className)) {
                fastdom.write(function () {
                    advert.node.classList.add('ad-slot__fluid250');
                });
            }
        };
    }

    function isFluid(className) {
        return function (_, advert) {
            if (advert.node.classList.contains(className)) {
                fastdom.write(function () {
                    advert.node.classList.add('ad-slot--fluid');
                });
            }
        };
    }

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
                    sizeCallbacks[size](slotRenderEvent, advert);
                }
            }

            function addRenderedClass() {
                return isRendered ? fastdom.write(function () {
                    advert.node.classList.add('ad-slot--rendered');
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
