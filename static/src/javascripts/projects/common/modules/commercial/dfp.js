/* global googletag: false */
define([
    'bean',
    'bonzo',
    'qwery',
    'lodash/functions/debounce',
    'lodash/arrays/flatten',
    'lodash/arrays/uniq',
    'lodash/collections/forEach',
    'lodash/collections/map',
    'lodash/functions/once',
    'lodash/objects/defaults',
    'lodash/objects/forOwn',
    'lodash/objects/keys',
    'lodash/objects/isArray',
    'lodash/objects/pairs',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/_',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/commercial/keywords',
    'common/modules/commercial/tags/audience-science',
    'common/modules/commercial/tags/audience-science-gateway',
    'common/modules/commercial/tags/criteo',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/experiments/ab',
    'common/modules/ui/sticky',
    'text!common/views/commercial/ad-slot.html'
], function (
    bean,
    bonzo,
    qwery,
    debounce,
    flatten,
    uniq,
    forEach,
    map,
    once,
    defaults,
    forOwn,
    keys,
    isArray,
    pairs,
    $,
    $css,
    _,
    config,
    cookies,
    detect,
    mediator,
    template,
    keywords,
    audienceScience,
    audienceScienceGateway,
    criteo,
    userAdTargeting,
    ab,
    Sticky,
    adSlotTpl
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
    var adSlotSelector    = '.ad-slot--dfp',
        displayed         = false,
        rendered          = false,
        slots             = {},
        slotsToRefresh    = [],
        breakoutClasses   = [
            'breakout__html',
            'breakout__script'
        ],
        adSlotDefinitions = {
            right: {
                sizeMappings: {
                    mobile: '300,250|300,251|300,600'
                }
            },
            'right-small': {
                name: 'right',
                sizeMappings: {
                    mobile: '300,250'
                }
            },
            im: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '88,85'
                }
            },
            inline1: {
                sizeMappings: {
                    mobile:             '300,50|300,250',
                    'mobile-landscape': '300,50|320,50|300,250',
                    tablet:             '300,250',
                    desktop:            '300,1|300,250'
                }
            },
            inline2: {
                sizeMappings: {
                    mobile: '300,50',
                    'mobile-landscape': '300,50|320,50',
                    tablet: '300,250'
                }
            },
            inline3: {
                sizeMappings: {
                    mobile: '300,50',
                    'mobile-landscape': '300,50|320,50',
                    tablet: '300,250'
                }
            },
            'merchandising-high': {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '88,87'
                }
            },
            spbadge: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '140,90'
                }
            },
            adbadge: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '140,90'
                }
            },
            fobadge: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '140,90'
                }
            }
        },
        callbacks = {
            '300,251': function (e, $adSlot) {
                new Sticky($adSlot.parent()[0], { top: 12 }).init();
            },
            '300,1': function (e, $adSlot) {
                $adSlot.addClass('u-h');
            }
        },

        /**
         * Initial commands
         */
        setListeners = function () {
            googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                rendered = true;
                mediator.emit('modules:commercial:dfp:rendered', event);
                parseAd(event);
            });
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
                // filter out hidden ads
                .filter(function ($adSlot) {
                    return $css($adSlot, 'display') !== 'none';
                })
                .map(function ($adSlot) {
                    return [$adSlot.attr('id'), defineSlot($adSlot)];
                })
                .zipObject()
                .valueOf();
        },
        displayAds = function () {
            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            googletag.enableServices();
            // as this is an single request call, only need to make a single display call (to the first ad slot)
            googletag.display(keys(slots).shift());
            displayed = true;
        },
        postDisplay = function () {
            var hasBreakpointChanged = detect.hasCrossedBreakpoint(true);
            mediator.on('window:resize',
                debounce(function () {
                    // refresh on resize
                    hasBreakpointChanged(refresh);
                }, 2000)
            );
        },

        /**
         * Public functions
         */
        init = function () {

            if (!config.switches.standardAdverts && !config.switches.commercialComponents) {
                return false;
            }

            if (!config.switches.standardAdverts) {
                adSlotSelector = '.ad-slot--commercial-component';
            } else if (!config.switches.commercialComponents) {
                adSlotSelector = '.ad-slot--dfp:not(.ad-slot--commercial-component)';
            }

            // if we don't already have googletag, create command queue and load it async
            if (!window.googletag) {
                window.googletag = { cmd: [] };
                // load the library asynchronously
                require(['googletag']);
            }

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
                    slots[slotId] = defineSlot($adSlot);
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
            var slot = slots[$adSlot.attr('id')];
            if (slot) {
                googletag.pubads().refresh([slot]);
            }
        },
        getSlots = function () {
            return slots;
        },
        createAdSlot = function (name, types, keywords, slotTarget) {
            var attrName,
                definition = adSlotDefinitions[slotTarget ? slotTarget : name],
                dataAttrs = {
                    refresh: definition.refresh !== undefined ? definition.refresh : true,
                    label: definition.label !== undefined ? definition.label : true
                },
                $adSlot = $.create(template(
                    adSlotTpl,
                    {
                        name: definition.name || name,
                        // badges now append their index to the name
                        normalisedName: (definition.name || name).replace(/((?:ad|fo|sp)badge).*/, '$1'),
                        types: map((isArray(types) ? types : [types]), function (type) { return 'ad-slot--' + type; }).join(' '),
                        sizeMappings: map(pairs(definition.sizeMappings), function (size) { return ' data-' + size[0] + '="' + size[1] + '"'; }).join('')
                    })
                );
            for (attrName in dataAttrs) {
                if (dataAttrs[attrName] === false) {
                    $adSlot.attr('data-' + attrName, 'false');
                }
            }
            if (slotTarget) {
                $adSlot.attr('data-slot-target', slotTarget);
            }
            if (keywords) {
                $adSlot.attr('data-keywords', keywords);
            }
            return $adSlot[0];
        },
        /**
         * Builds the appropriate page level targeting
         *
         * a      = audience science
         * at     = adtest cookie
         * bp     = current breakpoint
         * ct     = content type
         * k      = keywords
         * p      = platform
         * pt     = content type
         * url    = path
         */
        buildPageTargeting = function () {

            function encodeTargetValue(value) {
                return value ? keywords.format(value).replace(/&/g, 'and').replace(/'/g, '') : '';
            }

            var page        = config.page,
                series      = parseSeries(page),
                contentType = encodeTargetValue(page.contentType),
                edition     = encodeTargetValue(page.edition),
                mediaSource = encodeTargetValue(page.source);

            return defaults({
                url:     window.location.pathname,
                edition: edition,
                se:      series,
                ct:      contentType,
                pt:      contentType,
                p:       'ng',
                k:       parseKeywords(page.keywordIds || page.pageId),
                su:      page.isSurging,
                bp:      detect.getBreakpoint(),
                a:       audienceScience.getSegments(),
                at:      cookies.get('adtest') || cookies.get('GU_TEST') || '',
                gdncrm:  userAdTargeting.getUserSegments(),
                ab:      abParam(),
                co:      parseTargets(page.authorIds),
                bl:      parseKeywords(page.blogIds),
                ms:      mediaSource,
                tn:      parseTargets(page.tones)
            }, audienceScienceGateway.getSegments(), criteo.getSegments());
        },

        /**
         * Private functions
         */
        defineSlot = function ($adSlot) {
            var slotTarget  = $adSlot.data('slot-target') || $adSlot.data('name'),
                adUnit      = config.page.adUnit,
                id          = $adSlot.attr('id'),
                sizeMapping = defineSlotSizes($adSlot),
                // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
                size        = uniq(
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
            var $slot = $('#' + event.slot.getSlotId().getDomId()),
                size  = event.size.join(',');

            // remove any placeholder ad content
            $('.ad-slot__content--placeholder', $slot).remove();

            if (event.isEmpty) {
                removeLabel($slot);
            } else {
                checkForBreakout($slot);
                addLabel($slot);
            }

            // is there a callback for this size
            callbacks[size] && callbacks[size](event, $slot);
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
        breakoutIFrame = function (iFrame) {
            /* jshint evil: true */
            var iFrameBody    = iFrame.contentDocument.body,
                $iFrameParent = bonzo(iFrame).parent();

            if (iFrameBody) {
                forEach (breakoutClasses, function (breakoutClass) {
                    var $breakout = $('.' + breakoutClass, iFrameBody);
                    if ($breakout.length) {
                        // remove the iframe before breaking out
                        bonzo(iFrame).remove();
                        if ($breakout[0].nodeName.toLowerCase() === 'script') {
                            // evil, but we own the returning js snippet
                            eval($breakout.html());
                        } else {
                            $iFrameParent.append($breakout.html());
                            $('.ad--responsive', $iFrameParent[0]).each(function (responsiveAd) {
                                window.setTimeout(function () {
                                    bonzo(responsiveAd).addClass('ad--responsive--open');
                                }, 50);
                            });
                        }
                    }
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
            $('iframe', $slot[0]).each(function (iFrame) {
                // IE needs the iFrame to have loaded before we can interact with it
                if (iFrame.readyState && iFrame.readyState !== 'complete') {
                    bean.on(iFrame, 'readystatechange', function (e) {
                        var updatedIFrame = e.srcElement;
                        if (typeof updatedIFrame.readyState !== 'unknown' && updatedIFrame.readyState === 'complete') {
                            breakoutIFrame(updatedIFrame);
                            bean.off(updatedIFrame, 'readystatechange');
                        }
                    });
                } else {
                    breakoutIFrame(iFrame);
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
            return slotBreakpoint && getSlotsBreakpoint(previousBreakpoint, slotBreakpoints) !== slotBreakpoint;
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
        abParam = function () {
            var hchTest = ab.getParticipations().HighCommercialComponent;
            if (hchTest) {
                switch (hchTest.variant) {
                    case 'control':
                        return '1';
                    case 'variant':
                        return '2';
                }
            }
            return '3';
        },
        parseKeywords = function (keywords) {
            return map((keywords || '') .split(','), function (keyword) {
                return keyword.split('/').pop();
            });
        },
        parseSeries = function (page) {
            if (page.seriesId) {
                return page.seriesId.split('/').pop();
            }
            var seriesIdFromUrl = /\/series\/(.+)$/.exec(page.pageId);
            return seriesIdFromUrl === null ? '' : seriesIdFromUrl[1];
        },
        parseTargets = function (targets) {
            var targetArray = parseKeywords(targets);
            return map(targetArray, function (target) {
                return keywords.format(target);
            });
        },

        /**
         * Module
         */
        dfp = {
            init:               once(init),
            addSlot:            addSlot,
            refreshSlot:        refreshSlot,
            getSlots:           getSlots,
            buildPageTargeting: buildPageTargeting,
            createAdSlot:       createAdSlot
        };

    return dfp;

});
