/* global googletag: false */
define([
    'bean',
    'bonzo',
    'fastdom',
    'qwery',
    'raven',
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
    'common/modules/onward/geo-most-popular',
    'common/modules/experiments/ab',
    'common/modules/analytics/beacon'
], function (
    bean,
    bonzo,
    fastdom,
    qwery,
    raven,
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
    geoMostPopular,
    ab,
    beacon
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
            '300,250': function (event, $adSlot) {
                if (isMtRecTest() && $adSlot.hasClass('ad-slot--right')) {
                    if ($adSlot.attr('data-mobile').indexOf('300,251') > -1) {
                        // Hardcoded for sticky nav test. It will need some on time checking if this will go to PROD
                        new StickyMpu($adSlot, {top: 58}).create();
                    }
                }
            },
            '1,1': function (event, $adSlot) {
                if (!event.slot.getOutOfPage()) {
                    $adSlot.addClass('u-h');
                    var $parent = $adSlot.parent();
                    // if in a slice, add the 'no mpu' class
                    if ($parent.hasClass('js-fc-slice-mpu-candidate')) {
                        $parent.addClass('fc-slice__item--no-mpu');
                    }
                }
            },
            '300,1050': function () {
                // remove geo most popular
                geoMostPopular.whenRendered.then(function (geoMostPopular) {
                    fastdom.write(function () {
                        bonzo(geoMostPopular.elem).remove();
                    });
                });
            }
        },

        isMtRecTest = function () {
            var MtRec1Test = ab.getParticipations().MtRec1,
                MtRec2Test = ab.getParticipations().MtRec2;

            return ab.testCanBeRun('MtRec1') && MtRec1Test && MtRec1Test.variant === 'A' ||
                ab.testCanBeRun('MtRec2') && MtRec2Test && MtRec2Test.variant === 'A';
        },

        recordFirstAdRendered = _.once(function () {
            beacon.beaconCounts('ad-render');
        }),

        /**
         * Initial commands
         */
        setListeners = function () {
            googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(function (event) {
                rendered = true;
                recordFirstAdRendered();
                mediator.emit('modules:commercial:dfp:rendered', event);
                parseAd(event);
            }));
        },

        setPageTargeting = function () {
            if (config.switches.ophan && config.switches.ophanViewId) {
                require(['ophan/ng'],
                    function (ophan) {
                        var viewId = (ophan || {}).viewId;
                        setTarget({viewId: viewId});
                    },
                    function (err) {
                        raven.captureException(new Error('Error retrieving ophan (' + err + ')'), {
                            tags: {
                                feature: 'DFP'
                            }
                        });

                        setTarget();
                    }
                );
            } else {
                setTarget();
            }
        },

        setTarget = function (opts) {
            _.forOwn(buildPageTargeting(opts), function (value, key) {
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
                        fastdom.write(function () {
                            $adSlot.remove();
                        });
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
            googletag.display(_.keys(slots).shift());
            displayed = true;
        },
        displayLazyAds = function () {
            googletag.pubads().collapseEmptyDivs();
            googletag.enableServices();
            mediator.on('window:scroll', _.throttle(lazyLoad, 10));
            lazyLoad();
        },
        windowResize = _.debounce(
            function () {
                // refresh on resize
                hasBreakpointChanged(refresh);
            }, resizeTimeout
        ),
        postDisplay = function () {
            mediator.on('window:resize', windowResize);
        },

        isLzAdsSwitchOn = function () {
            return config.switches.lzAds;
        },

        /**
         * Public functions
         */
        init = function (options) {
            var opts = _.defaults(options || {}, {
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

            // We want to run lazy load if user is in the main test or if there is a switch on
            if (isMtRecTest() || isLzAdsSwitchOn()) {
                window.googletag.cmd.push(displayLazyAds);
            } else {
                window.googletag.cmd.push(displayAds);
            }
            // anything we want to happen after displaying ads
            window.googletag.cmd.push(postDisplay);

            return dfp;
        },
        lazyLoad = function () {
            if (slots.length === 0) {
                mediator.off('window:scroll');
            } else {
                fastdom.read(function () {
                    var scrollTop    = bonzo(document.body).scrollTop(),
                        scrollBottom = scrollTop + bonzo.viewport().height,
                        depth = 0.5;

                    _(slots).keys().forEach(function (slot) {
                        // if the position of the ad is above the viewport - offset (half screen size)
                        // Make sure page skin is loaded first
                        if (scrollBottom > document.getElementById(slot).getBoundingClientRect().top + scrollTop - bonzo.viewport().height * depth || slot === 'dfp-ad--pageskin-inread') {
                            googletag.display(slot);

                            slots = _(slots).omit(slot).value();
                            displayed = true;
                        }
                    });
                });
            }
        },
        addSlot = function ($adSlot) {
            var slotId = $adSlot.attr('id'),
                displayAd = function ($adSlot) {
                    slots[slotId] = {
                        isRendered: false,
                        slot: defineSlot($adSlot)
                    };
                    googletag.display(slotId);
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
                size           = _.uniq(
                    _.flatten(sizeMapping, true, function (map) {
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
                $slot = $('#' + slotId),
                $placeholder,
                $adSlotContent;

            allAdsRendered(slotId);

            if (event.isEmpty) {
                removeLabel($slot);
            } else {
                // remove any placeholder ad content
                $placeholder = $('.ad-slot__content--placeholder', $slot);
                $adSlotContent = $('#' + slotId + ' div');
                fastdom.write(function () {
                    $placeholder.remove();
                    $adSlotContent.addClass('ad-slot__content');
                });
                checkForBreakout($slot);
                addLabel($slot);
                size = event.size.join(',');
                // is there a callback for this size
                if (callbacks[size]) {
                    callbacks[size](event, $slot);
                }

                if ($slot.hasClass('ad-slot--container-inline') && $slot.hasClass('ad-slot--not-mobile')) {
                    fastdom.write(function () {
                        $slot.parent().css('display', 'flex');
                    });
                } else if (!($slot.hasClass('ad-slot--top-above-nav') && size === '1,1')) {
                    fastdom.write(function () {
                        $slot.parent().css('display', 'block');
                    });
                }

                if (($slot.hasClass('ad-slot--top-banner-ad') && size === '88,70')
                || ($slot.hasClass('ad-slot--commercial-component') && size === '88,88')) {
                    fastdom.write(function () {
                        $slot.addClass('ad-slot__fluid250');
                    });
                }
            }
        },
        allAdsRendered = function (slotId) {
            if (slots[slotId] && !slots[slotId].isRendered) {
                slots[slotId].isRendered = true;
            }

            if (_.every(slots, 'isRendered')) {
                userTiming.mark('All ads are rendered');
                mediator.emit('modules:commercial:dfp:alladsrendered');
            }
        },
        addLabel = function ($slot) {
            fastdom.write(function () {
                if (shouldRenderLabel($slot)) {
                    $slot.prepend('<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
                }
            });
        },
        removeLabel = function ($slot) {
            fastdom.write(function () {
                $('.ad-slot__label', $slot).remove();
            });
        },
        shouldRenderLabel = function ($slot) {
            return $slot.data('label') !== false && qwery('.ad-slot__label', $slot[0]).length === 0;
        },
        breakoutIFrame = function (iFrame, $slot) {
            /*eslint-disable no-eval*/
            var shouldRemoveIFrame = false,
                $iFrame            = bonzo(iFrame),
                iFrameBody         = iFrame.contentDocument.body,
                $iFrameParent      = $iFrame.parent();

            if (iFrameBody) {
                _.forEach(breakoutClasses, function (breakoutClass) {
                    $('.' + breakoutClass, iFrameBody).each(function (breakoutEl) {
                        var creativeConfig,
                            $breakoutEl     = bonzo(breakoutEl),
                            breakoutContent = $breakoutEl.html();

                        if (breakoutClass === 'breakout__script') {
                            // new way of passing data from DFP
                            if ($breakoutEl.attr('type') === 'application/json') {
                                creativeConfig = JSON.parse(breakoutContent);
                                require(['bootstraps/creatives'], function () {
                                    require(['common/modules/commercial/creatives/' + creativeConfig.name], function (Creative) {
                                        new Creative($slot, creativeConfig.params, creativeConfig.opts).create();
                                    });
                                });
                            } else {
                                // evil, but we own the returning js snippet
                                eval(breakoutContent);
                            }

                        } else {
                            fastdom.write(function () {
                                $iFrameParent.append(breakoutContent);
                                $breakoutEl.remove();
                            });

                            $('.ad--responsive', $iFrameParent[0]).each(function (responsiveAd) {
                                window.setTimeout(function () {
                                    fastdom.write(function () {
                                        bonzo(responsiveAd).addClass('ad--responsive--open');
                                    });
                                }, 50);
                            });
                        }
                        shouldRemoveIFrame = true;
                    });
                });
            }
            if (shouldRemoveIFrame) {
                fastdom.write(function () {
                    $iFrame.hide();
                });
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
                            /*eslint-disable valid-typeof*/
                            updatedIFrame &&
                                typeof updatedIFrame.readyState !== 'unknown' &&
                                updatedIFrame.readyState === 'complete'
                            /*eslint-enable valid-typeof*/
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
            return _.map(attr.split('|'), function (size) {
                return _.map(size.split(','), Number);
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

            _.forEach(detect.breakpoints, function (breakpointInfo) {
                // turn breakpoint name into attribute style (lowercase, hyphenated)
                var attr  = slot.data(breakpointNameToAttribute(breakpointInfo.name));
                if (attr) {
                    mapping.addSize([breakpointInfo.width, 0], createSizeMapping(attr));
                }
            });

            return mapping.build();
        },
        parseKeywords = function (keywords) {
            return _.map((keywords || '').split(','), function (keyword) {
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
