define([
    'bonzo',
    'qwery',
    'raven',
    'common/utils/$',
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
    $,
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
    sizeCallbacks[adSizes.stickyMpu] = function (event, $adSlot) {
        stickyMpu($adSlot);
    };

    /**
     * Trigger sticky scrolling for MPUs in the right-hand article column
     */
    sizeCallbacks[adSizes.mpu] = function (event, $adSlot) {
        if ($adSlot.hasClass('ad-slot--right')) {
            var mobileAdSizes = $adSlot.attr('data-mobile');
            if (mobileAdSizes && mobileAdSizes.indexOf(adSizes.stickyMpu) > -1) {
                stickyMpu($adSlot);
            }
        }
    };

    /**
     * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
     * and their containers closed up.
     */
    sizeCallbacks[adSizes.outOfPage] = function (event, $adSlot) {
        if (!event.slot.getOutOfPage()) {
            $adSlot.addClass('u-h');
            var $parent = $adSlot.parent();
            // if in a slice, add the 'no mpu' class
            if ($parent.hasClass('js-fc-slice-mpu-candidate')) {
                $parent.addClass('fc-slice__item--no-mpu');
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
        return function (_, $adSlot) {
            if ($adSlot.hasClass(className)) {
                fastdom.write(function () {
                    $adSlot.addClass('ad-slot__fluid250');
                });
            }
        };
    }

    function isFluid(className) {
        return function (_, $adSlot) {
            if ($adSlot.hasClass(className)) {
                fastdom.write(function () {
                    $adSlot.addClass('ad-slot--fluid');
                });
            }
        };
    }

    /**
     * @param adSlotId - DOM ID of the rendered slot
     * @param slotRenderEvent - GPT slotRenderEndedEvent
     * @returns {Promise} - resolves once all necessary rendering is queued up
     */
    function renderAdvert(adSlotId, slotRenderEvent) {
        var $adSlot = $('#' + adSlotId);

        // remove any placeholder ad content
        var $placeholder = $('.ad-slot__content--placeholder', $adSlot);
        var $adSlotContent = $('div', $adSlot);

        if ($adSlotContent[0]) {
            fastdom.write(function () {
                $placeholder.remove();
                $adSlotContent.addClass('ad-slot__content');
            });
        }

        return applyCreativeTemplate($adSlot).then(function () {
            renderAdvertLabel($adSlot);

            var size = slotRenderEvent.size.join(',');
            // is there a callback for this size?
            if (sizeCallbacks[size]) {
                sizeCallbacks[size](slotRenderEvent, $adSlot);
            }

            if ($adSlot.hasClass('ad-slot--container-inline') && $adSlot.hasClass('ad-slot--not-mobile')) {
                fastdom.write(function () {
                    $adSlot.parent().css('display', 'flex');
                });
            }
        }).catch(raven.captureException);
    }

    return renderAdvert;

});
