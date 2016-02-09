// Be wary of renaming this file; some titles, like 'dfp.js',
// can trigger adblocker rules, and make the module fail to load in dev.

/* global googletag: false */
define([
    'bean',
    'bonzo',
    'qwery',
    'Promise',
    'raven',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',
    'common/utils/user-timing',
    'common/utils/sha1',
    'common/utils/fastdom-idle',
    'common/utils/cookies',
    'common/modules/commercial/ads/sticky-mpu',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp/ophan-tracking',
    'common/modules/commercial/dfp/breakout-iframe',
    'common/modules/onward/geo-most-popular',
    'common/modules/experiments/ab',
    'common/modules/analytics/beacon',
    'common/modules/identity/api',
    'lodash/functions/once',
    'lodash/objects/forOwn',
    'lodash/collections/forEach',
    'lodash/objects/keys',
    'lodash/functions/debounce',
    'lodash/objects/defaults',
    'lodash/collections/contains',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten',
    'lodash/collections/every',
    'lodash/collections/map',
    'lodash/arrays/zipObject',
    'lodash/collections/filter',
    'common/utils/chain',
    'lodash/objects/omit',
    'lodash/collections/find',
    'lodash/arrays/last',
    'lodash/arrays/intersection',
    'lodash/arrays/initial',

    'common/modules/commercial/creatives/commercial-component',
    'common/modules/commercial/creatives/gu-style-comcontent',
    'common/modules/commercial/creatives/paidfor-content',
    'common/modules/commercial/creatives/expandable',
    'common/modules/commercial/creatives/expandable-v2',
    'common/modules/commercial/creatives/expandable-v3',
    'common/modules/commercial/creatives/expandable-video',
    'common/modules/commercial/creatives/expandable-video-v2',
    'common/modules/commercial/creatives/fluid250',
    'common/modules/commercial/creatives/fluid250-v3',
    'common/modules/commercial/creatives/fluid250-v4',
    'common/modules/commercial/creatives/fluid250GoogleAndroid',
    'common/modules/commercial/creatives/foundation-funded-logo',
    'common/modules/commercial/creatives/scrollable-mpu',
    'common/modules/commercial/creatives/scrollable-mpu-v2',
    'common/modules/commercial/creatives/template'
], function (
    bean,
    bonzo,
    qwery,
    Promise,
    raven,
    $,
    $css,
    config,
    detect,
    mediator,
    urlUtils,
    userTiming,
    sha1,
    idleFastdom,
    cookies,
    StickyMpu,
    buildPageTargeting,
    commercialFeatures,
    ophanTracking,
    breakoutIFrame,
    geoMostPopular,
    ab,
    beacon,
    id,
    once,
    forOwn,
    forEach,
    keys,
    debounce,
    defaults,
    contains,
    uniq,
    flatten,
    every,
    map,
    zipObject,
    filter,
    chain,
    omit,
    find,
    last,
    intersection,
    initial
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
     * Labels are automatically prepended to an ad that was successfully loaded.
     *
     */
    /**
     * Private variables
     */
    var resizeTimeout        = 2000;
    var adSlotSelector       = '.js-ad-slot';
    var displayed            = false;
    var rendered             = false;
    var slots                = {};
    var slotsToRefresh       = [];
    var creativeIDs          = [];
    var hasBreakpointChanged = detect.hasCrossedBreakpoint(true);

    var callbacks = {
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
                idleFastdom.write(function () {
                    bonzo(geoMostPopular.elem).remove();
                });
            });
        }
    };
    var renderStartTime = null;
    var recordFirstAdRendered = once(function () {
        beacon.beaconCounts('ad-render');
    });

    /**
     * Initial commands
     */
    function setListeners() {
        ophanTracking.trackPerformance(googletag, renderStartTime);

        googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(function (event) {
            rendered = true;
            recordFirstAdRendered();
            mediator.emit('modules:commercial:dfp:rendered', event);
            parseAd(event);
        }));
    }

    function setPageTargeting() {
        forOwn(buildPageTargeting(), function (value, key) {
            googletag.pubads().setTargeting(key, value);
        });
    }

    function isMobileBannerTest() {
        return config.switches.mobileTopBannerRemove && $('.top-banner-ad-container--ab-mobile').length > 0 && detect.getBreakpoint() === 'mobile';
    }

    function isSponsorshipContainerTest() {
        var sponsorshipIds = ['#dfp-ad--adbadge', '#dfp-ad--spbadge', '#dfp-ad--fobadge', '#dfp-ad--adbadge1', '#dfp-ad--spbadge1', '#dfp-ad--fobadge1', '#dfp-ad--adbadge2', '#dfp-ad--spbadge2', '#dfp-ad--fobadge2', '#dfp-ad--adbadge3', '#dfp-ad--spbadge3', '#dfp-ad--fobadge3', '#dfp-ad--adbadge4', '#dfp-ad--spbadge4', '#dfp-ad--fobadge4', '#dfp-ad--adbadge5', '#dfp-ad--spbadge5', '#dfp-ad--fobadge5'],
            sponsorshipIdsReturned = [];

        forEach(sponsorshipIds, function (value) {
            if ($(value).length) {
                sponsorshipIdsReturned.push(value);
            }
        });

        return sponsorshipIdsReturned;
    }

    function showSponsorshipPlaceholder() {
        var sponsorshipIdsFound = isSponsorshipContainerTest();

        if (detect.adblockInUse() && sponsorshipIdsFound.length) {
            idleFastdom.write(function () {
                forEach(sponsorshipIdsFound, function (value) {
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
    }

    function shouldFilterAdvert($adSlot) {
        return isVisuallyHidden() || isDisabledMobileBanner() || isDisabledCommercialFeature();

        function isVisuallyHidden() {
            return $css($adSlot, 'display') === 'none';
        }

        function isDisabledMobileBanner() {
            return isMobileBannerTest() && $adSlot.hasClass('ad-slot--top');
        }

        function isDisabledCommercialFeature() {
            return !commercialFeatures.topBannerAd && $adSlot.data('name') === 'top-above-nav';
        }
    }

    /**
     * Loop through each slot detected on the page and define it based on the data
     * attributes on the element.
     */
    function defineSlots() {
        slots = chain(qwery(adSlotSelector)).and(map, function (adSlot) {
                return bonzo(adSlot);
            // filter out (and remove) hidden ads
            }).and(filter, function ($adSlot) {
                if (shouldFilterAdvert($adSlot)) {
                    idleFastdom.write(function () {
                        $adSlot.remove();
                    });
                    return false;
                } else {
                    return true;
                }
            }).and(map, function ($adSlot) {
                return [$adSlot.attr('id'), {
                    isRendered: false,
                    isLoading: false,
                    slot: defineSlot($adSlot)
                }];
            }).and(zipObject).valueOf();
    }

    function setPublisherProvidedId() {
        var user = id.getUserFromCookie();
        if (user) {
            var hashedId = sha1.hash(user.id);
            googletag.pubads().setPublisherProvidedId(hashedId);
        }
    }

    function displayAds() {
        googletag.pubads().enableSingleRequest();
        googletag.pubads().collapseEmptyDivs();
        setPublisherProvidedId();
        googletag.enableServices();
        // as this is an single request call, only need to make a single display call (to the first ad
        // slot)
        googletag.display(keys(slots).shift());
        displayed = true;
    }

    function displayLazyAds() {
        googletag.pubads().collapseEmptyDivs();
        setPublisherProvidedId();
        googletag.enableServices();
        instantLoad();
        enableLazyLoad();
    }

    var lazyLoadEnabled = false;

    function enableLazyLoad() {
        if (!lazyLoadEnabled) {
            lazyLoadEnabled = true;
            mediator.on('window:throttledScroll', lazyLoad);
            lazyLoad();
        }
    }

    function disableLazyLoad() {
        lazyLoadEnabled = false;
        mediator.off('window:throttledScroll', lazyLoad);
    }

    var windowResize = debounce(
        function () {
            // refresh on resize
            hasBreakpointChanged(refresh);
        }, resizeTimeout
    );

    function postDisplay() {
        mediator.on('window:resize', windowResize);
    }

    function setupAdvertising() {
        // if we don't already have googletag, create command queue and load it async
        if (!window.googletag) {
            window.googletag = { cmd: [] };
            // load the library asynchronously
            require(['js!googletag.js']);
        }

        window.googletag.cmd.push = raven.wrap({ deep: true }, window.googletag.cmd.push);

        window.googletag.cmd.push(function () {
            renderStartTime = new Date().getTime();
        });
        window.googletag.cmd.push(setListeners);
        window.googletag.cmd.push(setPageTargeting);
        window.googletag.cmd.push(defineSlots);

        if (shouldLazyLoad()) {
            window.googletag.cmd.push(displayLazyAds);
        } else {
            window.googletag.cmd.push(displayAds);
        }
        // anything we want to happen after displaying ads
        window.googletag.cmd.push(postDisplay);

        // show sponsorship placeholder if adblock detected
        showSponsorshipPlaceholder();
    }

    function defineSlot($adSlot) {
        var slotTarget     = $adSlot.data('slot-target') || $adSlot.data('name'),
            adUnitOverride = urlUtils.getUrlVars()['ad-unit'],
            // if ?ad-unit=x, use that
            adUnit         = adUnitOverride ?
                ['/', config.page.dfpAccountId, '/', adUnitOverride].join('') : config.page.adUnit,
            id             = $adSlot.attr('id'),
            slot,
            size,
            sizeMapping;

        if ($adSlot.data('out-of-page')) {
            slot = googletag.defineOutOfPageSlot(adUnit, id);
        } else if ($adSlot.data('fluid') && cookies.get('adtest') === 'tm2') {
            $adSlot.addClass('ad-slot--fluid');
            sizeMapping = defineSlotSizes($adSlot);
            // SizeMappingBuilder does not handle 'fluid' very well,
            // so instead we add it manually ourselves to the end of each array of sizes
            forEach(sizeMapping, function (sizeMap) { sizeMap[1].push('fluid'); });
            slot = googletag.defineSlot(adUnit, 'fluid', id).defineSizeMapping(sizeMapping);
        } else {
            sizeMapping = defineSlotSizes($adSlot);
            // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
            size = uniq(
                flatten(sizeMapping, true, function (map) { return map[1]; }),
                function (size) { return size[0] + '-' + size[1]; }
            );
            slot = googletag.defineSlot(adUnit, size, id).defineSizeMapping(sizeMapping);
        }

        if ($adSlot.data('series')) {
            slot.setTargeting('se', parseKeywords($adSlot.data('series')));
        }

        if ($adSlot.data('keywords')) {
            slot.setTargeting('k', parseKeywords($adSlot.data('keywords')));
        }

        slot.addService(googletag.pubads())
            .setTargeting('slot', slotTarget);

        // Add to the array of ads to be refreshed (when the breakpoint changes)
        // only if it's `data-refresh` attribute isn't set to false.
        if ($adSlot.data('refresh') !== false) {
            slotsToRefresh.push({
                $adSlot: $adSlot,
                slot: slot
            });
        }

        return slot;
    }

    function parseAd(event) {
        var size,
            slotId = event.slot.getSlotElementId(),
            $slot,
            $placeholder,
            $adSlotContent;

        if (event.isEmpty) {
            removeSlot(slotId);
        } else {
            $slot = $('#' + slotId);

            // Store ads IDs for technical feedback
            creativeIDs.push(event.creativeId);

            // remove any placeholder ad content
            $placeholder = $('.ad-slot__content--placeholder', $slot);
            $adSlotContent = $('div', $slot);
            idleFastdom.write(function () {
                $placeholder.remove();
                $adSlotContent.addClass('ad-slot__content');
            });

            // Check if creative is a new gu style creative and place labels accordingly
            dfp.checkForBreakout($slot).then(function (adType) {
                if (adType !== 'gu-style') {
                    addLabel($slot);
                }

                size = event.size.join(',');
                // is there a callback for this size
                if (callbacks[size]) {
                    callbacks[size](event, $slot);
                }

                if ($slot.hasClass('ad-slot--container-inline') && $slot.hasClass('ad-slot--not-mobile')) {
                    idleFastdom.write(function () {
                        $slot.parent().css('display', 'flex');
                    });
                } else if (!($slot.hasClass('ad-slot--top-above-nav') && size === '1,1')) {
                    idleFastdom.write(function () {
                        $slot.parent().css('display', 'block');
                    });
                }

                if (($slot.hasClass('ad-slot--top-banner-ad') && size === '88,70')
                || ($slot.hasClass('ad-slot--commercial-component') && size === '88,88')) {
                    idleFastdom.write(function () {
                        $slot.addClass('ad-slot__fluid250');
                    });
                }
            });
        }

        allAdsRendered(slotId);
    }

    function allAdsRendered(slotId) {
        if (slots[slotId] && !slots[slotId].isRendered) {
            slots[slotId].isLoading = false;
            slots[slotId].isRendered = true;
        }

        if (every(slots, 'isRendered')) {
            userTiming.mark('All ads are rendered');
            mediator.emit('modules:commercial:dfp:alladsrendered');
        }
    }

    function addLabel($slot) {
        idleFastdom.write(function () {
            if (shouldRenderLabel($slot)) {
                $slot.prepend('<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            }
        });
    }

    function shouldRenderLabel($slot) {
        return $slot.data('label') !== false && qwery('.ad-slot__label', $slot[0]).length === 0;
    }

    function lazyLoad() {
        if (slots.length === 0) {
            disableLazyLoad();
        } else {
            var scrollTop = window.pageYOffset,
                viewportHeight = bonzo.viewport().height,
                scrollBottom = scrollTop + viewportHeight,
                depth = 0.5;

            chain(slots).and(keys).and(filter, function (slot) {
                return !slots[slot].isLoading &&
                    !slots[slot].isRendered &&
                        // if the position of the ad is above the viewport - offset (half screen size)
                    scrollBottom > document.getElementById(slot).getBoundingClientRect().top + scrollTop - viewportHeight * depth;
            }).and(forEach, function (slot) {
                loadSlot(slot);
            });
        }
    }

    function instantLoad() {
        chain(slots).and(keys).and(forEach, function (slot) {
            if (contains(['dfp-ad--pageskin-inread', 'dfp-ad--merchandising-high', 'dfp-ad--im'], slot)) {
                loadSlot(slot);
            }
        });
    }

    function loadSlot(slotKey) {
        slots[slotKey].isLoading = true;
        googletag.display(slotKey);
        displayed = true;
    }

    function removeSlot(slotId) {
        delete slots[slotId];
        idleFastdom.write(function () {
            $('#' + slotId).remove();
        });
    }

    /**
     * Checks the contents of the ad for special breakout classes.
     *
     * If one of these classes is detected, then the contents of that iframe is retrieved
     * and written onto the parent page.
     *
     * Currently this is being used for sponsored logos and commercial components so they
     * can inherit fonts.
     */
    function checkForBreakout($slot) {
        return new Promise(function (resolve, reject) {
            // DFP sometimes sends back two iframes, one with actual ad and one with 0,0 sizes and __hidden__ 'paramter'
            // The later one will never go to 'complete' state on IE so lets avoid it.
            var iFrame = find($('iframe', $slot), function (iframe) { return iframe.id.match('__hidden__') === null; });

            // No iFrame, no work to do
            if (typeof iFrame === 'undefined') {
                reject();
            }
            // IE needs the iFrame to have loaded before we can interact with it
            else if (iFrame.readyState && iFrame.readyState !== 'complete') {
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
        }).then(function (items) {
            return find(items, function (item) {
                return item.adType !== '';
            });
        });
    }

    function breakpointNameToAttribute(breakpointName) {
        return breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    function getSlotsBreakpoint(breakpoint, slotBreakpoints) {
        return chain(detect.breakpoints).and(initial, function (breakpointInfo) {
                return breakpointInfo.name !== breakpoint;
            }).and(intersection, slotBreakpoints).and(last).value();
    }

    function shouldSlotRefresh(slotInfo, breakpoint, previousBreakpoint) {
        // get the slots breakpoints
        var slotBreakpoints = chain(detect.breakpoints).and(filter, function (breakpointInfo) {
                return slotInfo.$adSlot.data(breakpointNameToAttribute(breakpointInfo.name));
            }).valueOf(),
            // have we changed breakpoints
            slotBreakpoint = getSlotsBreakpoint(breakpoint, slotBreakpoints);
        return slotBreakpoint &&
            getSlotsBreakpoint(previousBreakpoint, slotBreakpoints) !== slotBreakpoint;
    }

    function refresh(breakpoint, previousBreakpoint) {
        googletag.pubads().refresh(
            chain(slotsToRefresh)
                // only refresh if the slot needs to
                .and(filter, function (slotInfo) {
                    return shouldSlotRefresh(slotInfo, breakpoint, previousBreakpoint);
                }).and(map, function (slotInfo) {
                    return slotInfo.slot;
                }).valueOf()
        );
    }

    /** A breakpoint can have various sizes assigned to it. You can assign either on
     * set of sizes or multiple.
     *
     * One size       - `data-mobile="300,50"`
     * Multiple sizes - `data-mobile="300,50|320,50"`
     */
    function createSizeMapping(attr) {
        return map(attr.split('|'), function (size) {
            return map(size.split(','), Number);
        });
    }

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
    function defineSlotSizes(slot) {
        var mapping = googletag.sizeMapping();

        forEach(detect.breakpoints, function (breakpointInfo) {
            // turn breakpoint name into attribute style (lowercase, hyphenated)
            var attr  = slot.data(breakpointNameToAttribute(breakpointInfo.name));
            if (attr) {
                mapping.addSize([breakpointInfo.width, 0], createSizeMapping(attr));
            }
        });

        return mapping.build();
    }

    function parseKeywords(keywords) {
        return map((keywords || '').split(','), function (keyword) {
            return keyword.split('/').pop();
        });
    }

    function shouldLazyLoad() {
        // We do not want lazy loading on pageskins because it messes up the roadblock
        return config.switches.viewability && !(config.page.hasPageSkin && detect.getBreakpoint() === 'wide');
    }

    function getCreativeIDs() {
        return creativeIDs;
    }

    /**
     * Public functions
     */
    function init() {
        if (commercialFeatures.dfpAdvertising) {
            setupAdvertising();
        } else {
            $(adSlotSelector).remove();
        }
        return dfp;
    }

    function addSlot(adSlot) {
        var $adSlot = bonzo(adSlot),
            slotId = $adSlot.attr('id'),
            displayAd = function ($adSlot) {
                slots[slotId] = {
                    isRendered: false,
                    isLoading: false,
                    slot: defineSlot($adSlot)
                };
                if (shouldLazyLoad()) {
                    enableLazyLoad();
                } else {
                    loadSlot(slotId);
                }
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
    }

    function refreshSlot($adSlot) {
        var slot = slots[$adSlot.attr('id')].slot;
        if (slot) {
            googletag.pubads().refresh([slot]);
        }
    }

    function getSlots() {
        return slots;
    }

    /**
     * Module
     */
    var dfp = {
        init:           init,
        addSlot:        addSlot,
        refreshSlot:    refreshSlot,
        getSlots:       getSlots,
        // Used privately but exposed only for unit testing
        shouldLazyLoad: shouldLazyLoad,
        getCreativeIDs: getCreativeIDs,
        checkForBreakout: checkForBreakout,

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
