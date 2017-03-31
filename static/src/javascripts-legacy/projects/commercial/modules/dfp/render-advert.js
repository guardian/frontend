define([
    'qwery',
    'Promise',
    'lib/raven',
    'lib/fastdom-promise',
    'lib/mediator',
    'commercial/modules/ad-sizes',
    'commercial/modules/sticky-mpu',
    'commercial/modules/dfp/apply-creative-template',
    'commercial/modules/dfp/render-advert-label',
    'common/modules/onward/geo-most-popular',
    'common/modules/ui/toggles',
    'commercial/modules/user-ad-feedback',
    'lib/config'
], function (
    qwery,
    Promise,
    raven,
    fastdom,
    mediator,
    adSizes,
    stickyMpu,
    applyCreativeTemplate,
    renderAdvertLabel,
    geoMostPopular,
    Toggles,
    recordUserAdFeedback,
    config
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
                if (classNames.some(function (className) {
                    return advert.node.classList.contains(className);
                })) {
                    return fastdom.write(function () {
                        newClassNames.forEach(function (className) {
                            advert.node.classList.add(className);
                        });
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
    sizeCallbacks[adSizes.fluid] = addFluid(['ad-slot']);

    /**
     * Trigger sticky scrolling for MPUs in the right-hand article column
     */
    sizeCallbacks[adSizes.mpu] = function (_, advert) {
        if (advert.node.classList.contains('js-sticky-mpu')) {
            stickyMpu(advert.node);
        } else {
            return addFluid(['ad-slot--revealer'])(_, advert);
        }
    };

    /**
     * Resolve the stickyMpu.whenRendered promise
     */
    sizeCallbacks[adSizes.halfPage] = function () {
        mediator.emit('page:commercial:sticky-mpu');
    };

    sizeCallbacks[adSizes.video] = function (_, advert) {
        fastdom.write(function () {
            advert.node.classList.add('u-h');
        });
    };

    sizeCallbacks[adSizes.video2] = function (_, advert) {
        fastdom.write(function () {
            advert.node.classList.add('ad-slot--outstream');
        });
    };

    /**
     * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
     * and their containers closed up.
     */
    sizeCallbacks[adSizes.outOfPage] =
    sizeCallbacks[adSizes.empty] = function (event, advert) {
        if (!event.slot.getOutOfPage()) {
            var parent = advert.node.parentNode;
            return fastdom.write(function () {
                advert.node.classList.add('u-h');
                // if in a slice, add the 'no mpu' class
                if (parent.classList.contains('fc-slice__item--mpu-candidate')) {
                    parent.classList.add('fc-slice__item--no-mpu');
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
                geoMostPopular.elem.remove();
                geoMostPopular.elem = null;
            });
        });
    };

    /**
     * Commercial components with merch sizing get fluid-250 styling
     */
    sizeCallbacks[adSizes.merchandising] = addFluid250(['ad-slot--commercial-component']);

    /**
     * @param advert - as defined in commercial/modules/dfp/Advert
     * @param slotRenderEvent - GPT slotRenderEndedEvent
     * @returns {Promise} - resolves once all necessary rendering is queued up
     */
    function renderAdvert(advert, slotRenderEvent) {
        addContentClass(advert.node);

        return applyCreativeTemplate(advert.node).then(function (isRendered) {
            return callSizeCallback()
                .then(function () { return renderAdvertLabel(advert.node); })
                .then(addFeedbackDropdownToggle)
                .then(function () { return applyFeedbackOnClickListeners(slotRenderEvent); })
                .then(addRenderedClass)
                .then(function () {
                    return isRendered;
                });

            function callSizeCallback() {
                var size = advert.size.toString();
                if (size === '0,0') {
                    size = 'fluid';
                }
                return Promise.resolve(sizeCallbacks[size] ?
                    sizeCallbacks[size](slotRenderEvent, advert) :
                    null
                );
            }

            function addRenderedClass() {
                return isRendered ? fastdom.write(function () {
                    advert.node.classList.add('ad-slot--rendered');
                }) : Promise.resolve();
            }

            function addFeedbackDropdownToggle() {
                return (config.switches.adFeedback && isRendered) ? fastdom.write(function () {
                    if (!advert.node.classList.contains('js-toggle-ready')){
                        new Toggles(advert.node).init();
                    }
                }) : Promise.resolve();
            }

            function applyFeedbackOnClickListeners(slotRenderEvent) {
                var readyClass = 'js-onclick-ready';
                return (config.switches.adFeedback && isRendered) ? fastdom.write(function () {
                    qwery('.js-ad-feedback-option:not(.js-onclick-ready)').forEach(function(el) {
                        var slotId = el.getAttribute('data-slot');
                        var problem = el.getAttribute('data-problem');
                        el.addEventListener('click', function() {
                            recordUserAdFeedback(window.location.pathname, slotId, slotRenderEvent, problem);
                        });
                        el.classList.add(readyClass);
                    });
                    qwery('.js-ad-feedback-option-other:not(.js-onclick-ready)').forEach(function(el) {
                        var form = qwery('form', el)[0];
                        var commentBox = qwery('input', el)[0];
                        var slotId = el.getAttribute('data-slot');
                        el.addEventListener('click', function(e) {
                            if(e.target.tagName !== 'BUTTON' || !commentBox.value) {
                                e.stopImmediatePropagation();
                            }
                        });
                        form.addEventListener('submit', function(e) {
                            e.preventDefault();
                            recordUserAdFeedback(window.location.pathname, slotId, slotRenderEvent, 'other', commentBox.value);
                        });
                        el.classList.add(readyClass);
                    });
                }) : Promise.resolve();
            }
        }).catch(raven.captureException);
    }

    function addContentClass(adSlotNode) {
        var adSlotContent = qwery('> div:not(.ad-slot__label)', adSlotNode);

        if (adSlotContent.length) {
            fastdom.write(function () {
                adSlotContent[0].classList.add('ad-slot__content');
            });
        }
    }

    return renderAdvert;

});
