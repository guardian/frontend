/* global googletag: false */
define([
    'bean',
    'bonzo',
    'fastdom',
    'qwery',
    'Promise',
    'raven',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',
    'common/utils/user-timing',
    'common/utils/sha1',
    'common/modules/commercial/ads/sticky-mpu',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp-ophan-tracking',
    'common/modules/onward/geo-most-popular',
    'common/modules/experiments/ab',
    'common/modules/analytics/beacon',
    'common/modules/identity/api',
    'common/modules/adfree-survey',
    'common/modules/adfree-survey-simple',
    'common/views/svgs'
], function (
    bean,
    bonzo,
    fastdom,
    qwery,
    Promise,
    raven,
    $,
    $css,
    _,
    config,
    detect,
    mediator,
    urlUtils,
    userTiming,
    sha1,
    StickyMpu,
    buildPageTargeting,
    commercialFeatures,
    dfpOphanTracking,
    geoMostPopular,
    ab,
    beacon,
    id,
    AdfreeSurvey,
    AdfreeSurveySimple,
    svgs
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
                if (config.switches.viewability && $adSlot.hasClass('ad-slot--right')) {
                    if ($adSlot.attr('data-mobile').indexOf('300,251') > -1) {
                        // Hardcoded for sticky nav test. It will need some on time checking if this will go to PROD
                        new StickyMpu($adSlot, {top: 58}).create();
                    }
                }
                if (isAdfreeSurvey('variant') || isAdfreeSurvey('simple')) {
                    showAdsFreeSurvey('300,250', $adSlot);
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
        renderStartTime = null,

        isAdfreeSurvey = function (variant) {
            return ab.getParticipations().DisableAdsSurvey && ab.testCanBeRun('DisableAdsSurvey')
                && ab.getParticipations().DisableAdsSurvey.variant === variant;
        },

        recordFirstAdRendered = _.once(function () {
            beacon.beaconCounts('ad-render');
        }),

        /**
         * Initial commands
         */
        setListeners = function () {
            dfpOphanTracking.trackPerformance(googletag, renderStartTime);

            googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(function (event) {
                rendered = true;
                recordFirstAdRendered();
                mediator.emit('modules:commercial:dfp:rendered', event);
                parseAd(event);
            }));
        },

        setPageTargeting = function () {
            _.forOwn(buildPageTargeting(), function (value, key) {
                googletag.pubads().setTargeting(key, value);
            });
        },

        isMobileBannerTest = function () {
            return config.switches.mobileTopBannerRemove && $('.top-banner-ad-container--ab-mobile').length > 0 && detect.getBreakpoint() === 'mobile';
        },

        isSponsorshipContainerTest = function () {
            var sponsorshipIds = ['#dfp-ad--adbadge', '#dfp-ad--spbadge', '#dfp-ad--fobadge', '#dfp-ad--adbadge1', '#dfp-ad--spbadge1', '#dfp-ad--fobadge1', '#dfp-ad--adbadge2', '#dfp-ad--spbadge2', '#dfp-ad--fobadge2', '#dfp-ad--adbadge3', '#dfp-ad--spbadge3', '#dfp-ad--fobadge3', '#dfp-ad--adbadge4', '#dfp-ad--spbadge4', '#dfp-ad--fobadge4', '#dfp-ad--adbadge5', '#dfp-ad--spbadge5', '#dfp-ad--fobadge5'],
                sponsorshipIdsReturned = [];

            _.forEach(sponsorshipIds, function (value) {
                if ($(value).length) {
                    sponsorshipIdsReturned.push(value);
                }
            });

            return sponsorshipIdsReturned;
        },

        showSponsorshipPlaceholder = function () {
            var sponsorshipIdsFound = isSponsorshipContainerTest();

            if (detect.adblockInUse && sponsorshipIdsFound.length) {
                fastdom.write(function () {
                    _.forEach(sponsorshipIdsFound, function (value) {
                        var sponsorshipIdFoundEl = $(value),
                            sponsorshipIdClasses = sponsorshipIdFoundEl.attr('class').replace('ad-slot ', ''),
                            sponsorshipBadge = '<div class="' + sponsorshipIdClasses + '">' + sponsorshipIdFoundEl.html() + '</div>';

                        if (sponsorshipIdFoundEl.previous().length) {
                            sponsorshipIdFoundEl.previous().append(sponsorshipBadge);
                        } else {
                            sponsorshipIdFoundEl.parent().prepend(sponsorshipBadge);
                        }
                    });
                });
            }
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
                    if ($css($adSlot, 'display') === 'none' || (isMobileBannerTest() && $adSlot.hasClass('ad-slot--top'))) {
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
        setPublisherProvidedId = function () {
            var user = id.getUserFromCookie();
            if (user) {
                var hashedId = sha1.hash(user.id);
                googletag.pubads().setPublisherProvidedId(hashedId);
            }
        },
        displayAds = function () {
            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            setPublisherProvidedId();
            googletag.enableServices();
            // as this is an single request call, only need to make a single display call (to the first ad
            // slot)
            googletag.display(_.keys(slots).shift());
            displayed = true;
        },
        displayLazyAds = function () {
            googletag.pubads().collapseEmptyDivs();
            setPublisherProvidedId();
            googletag.enableServices();
            mediator.on('window:throttledScroll', lazyLoad);
            instantLoad();
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
        showAdsFreeSurvey = function (size, $adSlot) {
            fastdom.write(function () {
                var crossIcon = svgs('crossIcon'),
                    dataAttr = isAdfreeSurvey('variant') ? 'hide ads' : 'hide ads simple',
                    $adSlotRemove = $(document.createElement('div')).addClass('ad-slot--remove').attr('data-link-name', dataAttr)
                        .append('<a href="#" class="ad-slot--hide-ads" data-link-name="hide adslot: ' + size + '">Hide ads ' + crossIcon + '</a>').appendTo($adSlot);

                bean.on(document, 'click', $adSlotRemove, function (e) {
                    e.preventDefault();
                    $('.js-survey-overlay').removeClass('u-h');
                });
            });
        },
        setupAdvertising = function (options) {
            var opts = _.defaults(options || {}, {
                resizeTimeout: 2000
            });

            resizeTimeout = opts.resizeTimeout;

            // if we don't already have googletag, create command queue and load it async
            if (!window.googletag) {
                window.googletag = { cmd: [] };
                // load the library asynchronously
                // .js must be added: https://github.com/systemjs/systemjs/issues/528
                require(['js!googletag.js']);
            }

            window.googletag.cmd.push = raven.wrap({ deep: true }, window.googletag.cmd.push);

            window.googletag.cmd.push(function () {
                renderStartTime = new Date().getTime();
            });
            window.googletag.cmd.push(setListeners);
            window.googletag.cmd.push(setPageTargeting);
            window.googletag.cmd.push(defineSlots);

            if (_shouldLazyLoad()) {
                window.googletag.cmd.push(displayLazyAds);
            } else {
                window.googletag.cmd.push(displayAds);
            }
            // anything we want to happen after displaying ads
            window.googletag.cmd.push(postDisplay);

            // show sponsorship placeholder if adblock detected
            showSponsorshipPlaceholder();
        },

        /**
         * Public functions
         */
        init = function (options) {
            if (commercialFeatures.dfpAdvertising) {
                setupAdvertising(options);
            } else {
                $(adSlotSelector).remove();
            }
            return dfp;
        },
        instantLoad = function () {
            _(slots).keys().forEach(function (slot) {
                if (_.contains(['dfp-ad--pageskin-inread', 'dfp-ad--merchandising-high'], slot)) {
                    loadSlot(slot);
                }
            });
        },
        lazyLoad = function () {
            if (slots.length === 0) {
                mediator.off('window:throttledScroll');
            } else {
                var scrollTop    = window.pageYOffset,
                    viewportHeight = bonzo.viewport().height,
                    scrollBottom = scrollTop + viewportHeight,
                    depth = 0.5;

                _(slots).keys().forEach(function (slot) {
                    // if the position of the ad is above the viewport - offset (half screen size)
                    if (scrollBottom > document.getElementById(slot).getBoundingClientRect().top + scrollTop - viewportHeight * depth) {
                        loadSlot(slot);
                    }
                });
            }
        },
        loadSlot = function (slot) {
            googletag.display(slot);
            slots = _(slots).omit(slot).value();
            displayed = true;
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

                // Check if creative is a new gu style creative and place labels accordingly
                checkForBreakout($slot).then(function (adType) {
                    if (!adType || adType.type !== 'gu-style') {
                        addLabel($slot);
                    }

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
                });
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
                var adSlotClass = (isAdfreeSurvey('variant') || isAdfreeSurvey('simple')) ? 'ad-slot__label ad-slot__survey' : 'ad-slot__label';

                if (shouldRenderLabel($slot)) {
                    $slot.prepend('<div class="' + adSlotClass + '" data-test-id="ad-slot-label">Advertisement</div>');
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
                $iFrameParent      = $iFrame.parent(),
                type               = {};

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

                            type = {
                                type: creativeConfig.params.adType || '',
                                variant: creativeConfig.params.adVariant || ''
                            };

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

            return type;
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
            return Promise.all(_.map($('iframe', $slot), function (iFrame) {
                return new Promise(function (resolve) {
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
                                bean.off(updatedIFrame, 'readystatechange');
                                resolve(breakoutIFrame(updatedIFrame, $slot));
                            }
                        });
                    } else {
                        resolve(breakoutIFrame(iFrame, $slot));
                    }
                });
            })).then(function (items) {
                return _(items)
                    .chain()
                    .find(function (item) {
                        return item.adType !== '';
                    }).value();
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
         * Used privately but exposed pnly for unit testing
         * */
        _shouldLazyLoad = function () {
            // We do not want lazy loading on pageskins because it messes up the roadblock
            return config.switches.viewability && !(config.page.hasPageSkin && detect.getBreakpoint() === 'wide');
        },

        /**
         * Module
         */
        dfp = {
            init:           init,
            addSlot:        addSlot,
            refreshSlot:    refreshSlot,
            getSlots:       getSlots,
            shouldLazyLoad: _shouldLazyLoad,

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
