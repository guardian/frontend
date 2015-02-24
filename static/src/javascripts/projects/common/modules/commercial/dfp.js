/* global googletag: false */
define([
    'bean',
    'bonzo',
    'qwery',
    'raven',
    'lodash/functions/debounce',
    'lodash/arrays/flatten',
    'lodash/arrays/uniq',
    'lodash/collections/forEach',
    'lodash/collections/map',
    'lodash/functions/once',
    'lodash/objects/defaults',
    'lodash/objects/forOwn',
    'lodash/objects/keys',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',
    'common/utils/user-timing',
    'common/modules/commercial/ads/sticky-mpu',
    'common/modules/commercial/build-page-targeting',
    'common/modules/onward/geo-most-popular'
], function (
    bean,
    bonzo,
    qwery,
    raven,
    debounce,
    flatten,
    uniq,
    forEach,
    map,
    once,
    defaults,
    forOwn,
    keys,
    $,
    $css,
    _,
    config,
    detect,
    mediator,
    urlUtils,
    userTiming,
    StickyMpu,
    buildPageTargeting,
    geoMostPopular
) {

    /**
     * Right, so an explanation as to how this works...
     *
     * Create a new ad slot using the following code:
     *
     * <div class="ad-slot__dfp AD_SLOT_CLASS" data-name="AD_SLOT_NAME" data-mobile="300,50|320,50"
     *      data-desktop="300,250" data-refresh="false" data-label="false">
     *     <div id="SLOT_ID" class="ad-container"></div>
     * </div>
     *
     * You can set the set which size ad(s) should be loaded at which breakpoint by using the
     * data attribute. The available breakpoints and their sizes are listed in the config below.
     * You do not need to specify all of these. If you set a mobile size, then that size will be used
     * for all ads in that slot until another breakpoint is detected, in the above case, that's desktop.
     *
     * There is also a function for breaking the ad content out of their iframes. This can be done by
     * adding the classes below (breakoutClasses) to the ad content (in DFP).
     *
     * Labels are automatically prepended to an ad that was successfully loaded.
     *
     */
    /**
     * Private variables
     */
    var resizeTimeout,
        adSlotSelector       = '.js-ad-slot',
        displayed            = false,
        rendered             = false,
        slots                = {},
        slotsToRefresh       = [],
        hasBreakpointChanged = detect.hasCrossedBreakpoint(true),
        breakoutClasses      = [
            'breakout__html',
            'breakout__script'
        ],
        callbacks = {
            '300,251': function (event, $adSlot) {
                new StickyMpu($adSlot).create();
            },
            '1,1': function (event, $adSlot) {
                if (!event.slot.getOutOfPage()) {
                    $adSlot.addClass('u-h');
                    var $parent = $adSlot.parent();
                    // if in a slice, add the 'no mpu' class
                    $parent.hasClass('js-fc-slice-mpu-candidate') &&
                        $parent.addClass('fc-slice__item--no-mpu');
                }
            },
            '300,1050': function () {
                // remove geo most popular
                geoMostPopular.whenRendered.then(function (geoMostPopular) {
                    bonzo(geoMostPopular.elem).remove();
                });
            }
        },

        /**
         * Initial commands
         */
        setListeners = function () {
            googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(function (event) {
                rendered = true;
                mediator.emit('modules:commercial:dfp:rendered', event);
                parseAd(event);
            }));
        },
        setPageTargeting = function () {
            forOwn(buildPageTargeting(), function (value, key) {
                googletag.pubads().setTargeting(key, value);
            });
        },
        /**
         * Loop through each slot detected on the page and define it based on the data
         * attributes on the element.
         */
        defineSlots = function () {
            slots = _(qwery(adSlotSelector))
                .map(function (adSlot) {
                    return bonzo(adSlot);
                })
                // filter out (and remove) hidden ads
                .filter(function ($adSlot) {
                    if ($css($adSlot, 'display') === 'none') {
                        $adSlot.remove();
                        return false;
                    } else {
                        return true;
                    }
                })
                .map(function ($adSlot) {
                    return [$adSlot.attr('id'), {
                        isRendered: false,
                        slot: defineSlot($adSlot)
                    }];
                })
                .zipObject()
                .valueOf();
        },
        displayAds = function () {
            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            googletag.enableServices();
            // as this is an single request call, only need to make a single display call (to the first ad
            // slot)
            googletag.display(keys(slots).shift());
            displayed = true;
        },
        windowResize = debounce(
            function () {
                // refresh on resize
                hasBreakpointChanged(refresh);
            }, resizeTimeout
        ),
        postDisplay = function () {
            mediator.on('window:resize', windowResize);
        },

        /**
         * Public functions
         */
        init = function (options) {

            var opts = defaults(options || {}, {
                resizeTimeout: 2000
            });

            resizeTimeout = opts.resizeTimeout;

            // if we don't already have googletag, create command queue and load it async
            if (!window.googletag) {
                window.googletag = { cmd: [] };
                // load the library asynchronously
                require(['js!googletag']);
            }

            window.googletag.cmd.push = raven.wrap({ deep: true }, window.googletag.cmd.push);

            window.googletag.cmd.push(setListeners);
            window.googletag.cmd.push(setPageTargeting);
            window.googletag.cmd.push(defineSlots);
            window.googletag.cmd.push(displayAds);
            // anything we want to happen after displaying ads
            window.googletag.cmd.push(postDisplay);

            return dfp;

        },
        addSlot = function ($adSlot) {
            var slotId = $adSlot.attr('id'),
                displayAd = function ($adSlot) {
                    slots[slotId] = {
                        isRendered: false,
                        slot: defineSlot($adSlot)
                    };
                    googletag.display(slotId);
                    refreshSlot($adSlot);
                };
            if (displayed && !slots[slotId]) { // dynamically add ad slot
                // this is horrible, but if we do this before the initial ads have loaded things go awry
                if (rendered) {
                    displayAd($adSlot);
                } else {
                    mediator.once('modules:commercial:dfp:rendered', function () {
                        displayAd($adSlot);
                    });
                }
            }
        },
        refreshSlot = function ($adSlot) {
            var slot = slots[$adSlot.attr('id')].slot;
            if (slot) {
                googletag.pubads().refresh([slot]);
            }
        },
        getSlots = function () {
            return slots;
        },

        /**
         * Private functions
         */
        defineSlot = function ($adSlot) {
            var slotTarget     = $adSlot.data('slot-target') || $adSlot.data('name'),
                adUnitOverride = urlUtils.getUrlVars()['ad-unit'],
                // if ?ad-unit=x, use that
                adUnit         = adUnitOverride ?
                    ['/', config.page.dfpAccountId, '/', adUnitOverride].join('') : config.page.adUnit,
                id             = $adSlot.attr('id'),
                sizeMapping    = defineSlotSizes($adSlot),
                // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
                size           = uniq(
                    flatten(sizeMapping, true, function (map) {
                        return map[1];
                    }),
                    function (size) {
                        return size[0] + '-' + size[1];
                    }
                ),
                slot = (
                    $adSlot.data('out-of-page') ?
                        googletag.defineOutOfPageSlot(adUnit, id) :
                        googletag.defineSlot(adUnit, size, id)
                    )
                    .addService(googletag.pubads())
                    .defineSizeMapping(sizeMapping)
                    .setTargeting('slot', slotTarget);

            if ($adSlot.data('series')) {
                slot.setTargeting('se', parseKeywords($adSlot.data('series')));
            }

            if ($adSlot.data('keywords')) {
                slot.setTargeting('k', parseKeywords($adSlot.data('keywords')));
            }

            // Add to the array of ads to be refreshed (when the breakpoint changes)
            // only if it's `data-refresh` attribute isn't set to false.
            if ($adSlot.data('refresh') !== false) {
                slotsToRefresh.push({
                    $adSlot: $adSlot,
                    slot: slot
                });
            }

            return slot;
        },
        parseAd = function (event) {
            var size,
                slotId = event.slot.getSlotId().getDomId(),
                $slot = $('#' + slotId);

            allAdsRendered(slotId);

            if (event.isEmpty) {
                removeLabel($slot);
            } else {
                // remove any placeholder ad content
                $('.ad-slot__content--placeholder', $slot).remove();
                checkForBreakout($slot);
                addLabel($slot);
                size = event.size.join(',');
                // is there a callback for this size
                callbacks[size] && callbacks[size](event, $slot);

                if (!($slot.hasClass('ad-slot--top-above-nav') && size === '1,1')) {
                    $slot.parent().css('display', 'block');
                }

                if (($slot.hasClass('ad-slot--top-banner-ad') && size === '88,70')
                || ($slot.hasClass('ad-slot--commercial-component') && size === '88,88')) {
                    $slot.addClass('ad-slot__fluid250');
                }
            }
        },
        allAdsRendered = function (slotId) {
            if (slots[slotId] && !slots[slotId].isRendered) {
                slots[slotId].isRendered = true;
            }

            if (_.every(slots, 'isRendered')) {
                userTiming.mark('All ads are rendered');
            }
        },
        addLabel = function ($slot) {
            if (shouldRenderLabel($slot)) {
                $slot.prepend('<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            }
        },
        removeLabel = function ($slot) {
            $('.ad-slot__label', $slot).remove();
        },
        shouldRenderLabel = function ($slot) {
            return $slot.data('label') !== false && qwery('.ad-slot__label', $slot[0]).length === 0;
        },
        breakoutIFrame = function (iFrame, $slot) {
            /* jshint evil: true */
            var shouldRemoveIFrame = false,
                $iFrame            = bonzo(iFrame),
                iFrameBody         = iFrame.contentDocument.body,
                $iFrameParent      = $iFrame.parent();

            if (iFrameBody) {
                forEach(breakoutClasses, function (breakoutClass) {
                    $('.' + breakoutClass, iFrameBody).each(function (breakoutEl) {
                        var creativeConfig,
                            $breakoutEl     = bonzo(breakoutEl),
                            breakoutContent = $breakoutEl.html();

                        if (breakoutClass === 'breakout__script') {
                            // new way of passing data from DFP
                            if ($breakoutEl.attr('type') === 'application/json') {
                                creativeConfig = JSON.parse(breakoutContent);
                                require('bootstraps/creatives')
                                    .next(['common/modules/commercial/creatives/' + creativeConfig.name], function (Creative) {
                                        new Creative($slot, creativeConfig.params, creativeConfig.opts).create();
                                    });
                            } else {
                                // evil, but we own the returning js snippet
                                eval(breakoutContent);
                            }

                        } else {
                            $iFrameParent.append(breakoutContent);
                            $breakoutEl.remove();

                            $('.ad--responsive', $iFrameParent[0]).each(function (responsiveAd) {
                                window.setTimeout(function () {
                                    bonzo(responsiveAd).addClass('ad--responsive--open');
                                }, 50);
                            });
                        }
                        shouldRemoveIFrame = true;
                    });
                });
            }
            if (shouldRemoveIFrame) {
                $iFrame.hide();
            }
        },
        /**
         * Checks the contents of the ad for special classes (see breakoutClasses).
         *
         * If one of these classes is detected, then the contents of that iframe is retrieved
         * and written onto the parent page.
         *
         * Currently this is being used for sponsored logos and commercial components so they
         * can inherit fonts.
         */
        checkForBreakout = function ($slot) {
            $('iframe', $slot).each(function (iFrame) {
                // IE needs the iFrame to have loaded before we can interact with it
                if (iFrame.readyState && iFrame.readyState !== 'complete') {
                    bean.on(iFrame, 'readystatechange', function (e) {
                        var updatedIFrame = e.srcElement;

                        if (
                            updatedIFrame &&
                                typeof updatedIFrame.readyState !== 'unknown' &&
                                updatedIFrame.readyState === 'complete'
                        ) {
                            breakoutIFrame(updatedIFrame, $slot);
                            bean.off(updatedIFrame, 'readystatechange');
                        }
                    });
                } else {
                    breakoutIFrame(iFrame, $slot);
                }
            });
        },
        breakpointNameToAttribute = function (breakpointName) {
            return breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },
        getSlotsBreakpoint = function (breakpoint, slotBreakpoints) {
            return _(detect.breakpoints)
                .initial(function (breakpointInfo) {
                    return breakpointInfo.name !== breakpoint;
                })
                .intersection(slotBreakpoints)
                .last();
        },
        shouldSlotRefresh = function (slotInfo, breakpoint, previousBreakpoint) {
            // get the slots breakpoints
            var slotBreakpoints = _(detect.breakpoints)
                .filter(function (breakpointInfo) {
                    return slotInfo.$adSlot.data(breakpointNameToAttribute(breakpointInfo.name));
                })
                .valueOf(),
                // have we changed breakpoints
                slotBreakpoint = getSlotsBreakpoint(breakpoint, slotBreakpoints);
            return slotBreakpoint &&
                getSlotsBreakpoint(previousBreakpoint, slotBreakpoints) !== slotBreakpoint;
        },
        refresh = function (breakpoint, previousBreakpoint) {
            googletag.pubads().refresh(
                _(slotsToRefresh)
                    // only refresh if the slot needs to
                    .filter(function (slotInfo) {
                        return shouldSlotRefresh(slotInfo, breakpoint, previousBreakpoint);
                    })
                    .map(function (slotInfo) {
                        return slotInfo.slot;
                    })
                    .valueOf()
            );
        },
        /** A breakpoint can have various sizes assigned to it. You can assign either on
         * set of sizes or multiple.
         *
         * One size       - `data-mobile="300,50"`
         * Multiple sizes - `data-mobile="300,50|320,50"`
         */
        createSizeMapping = function (attr) {
            return map(attr.split('|'), function (size) {
                return map(size.split(','), Number);
            });
        },
        /**
         * Builds and assigns the correct size map for a slot based on the breakpoints
         * attached to the element via data attributes.
         *
         * A new size map is created for a given slot. We then loop through each breakpoint
         * defined in the config, checking if that breakpoint has been set on the slot.
         *
         * If it has been defined, then we add that size to the size mapping.
         *
         */
        defineSlotSizes = function (slot) {
            var mapping = googletag.sizeMapping();

            forEach(detect.breakpoints, function (breakpointInfo) {
                // turn breakpoint name into attribute style (lowercase, hyphenated)
                var attr  = slot.data(breakpointNameToAttribute(breakpointInfo.name));
                if (attr) {
                    mapping.addSize([breakpointInfo.width, 0], createSizeMapping(attr));
                }
            });

            return mapping.build();
        },
        parseKeywords = function (keywords) {
            return map((keywords || '').split(','), function (keyword) {
                return keyword.split('/').pop();
            });
        },

        /**
         * Module
         */
        dfp = {
            init:        init,
            addSlot:     addSlot,
            refreshSlot: refreshSlot,
            getSlots:    getSlots,

            // testing
            reset: function () {
                displayed      = false;
                rendered       = false;
                slots          = {};
                slotsToRefresh = [];
                mediator.off('window:resize', windowResize);
                hasBreakpointChanged = detect.hasCrossedBreakpoint(true);
            }
        };

    return dfp;

});
