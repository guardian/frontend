// Be wary of renaming this file; some titles, like 'dfp.js',
// can trigger adblocker rules, and make the module fail to load in dev.

define([
    'bean',
    'bonzo',
    'qwery',
    'Promise',
    'raven',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'common/utils/report-error',
    'common/utils/sha1',
    'common/utils/url',
    'common/utils/user-timing',
    'common/modules/commercial/ads/sticky-mpu',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp/ophan-tracking',
    'common/modules/commercial/dfp/breakout-iframe',
    'common/modules/commercial/dfp/PrebidService',
    'common/modules/commercial/dfp/track-ad-load',
    'common/modules/onward/geo-most-popular',
    'common/modules/experiments/ab',
    'common/modules/analytics/beacon',
    'common/modules/identity/api',
    'common/views/svgs',
    'lodash/functions/once',
    'lodash/objects/forOwn',
    'lodash/functions/debounce',
    'lodash/collections/contains',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten',
    'lodash/collections/every',
    'lodash/collections/map',
    'lodash/collections/filter',
    'common/utils/chain',
    'lodash/collections/find',
    'lodash/arrays/last',
    'lodash/arrays/intersection',
    'lodash/arrays/initial'
], function (
    bean,
    bonzo,
    qwery,
    Promise,
    raven,
    $,
    $css,
    config,
    cookies,
    detect,
    fastdom,
    mediator,
    reportError,
    sha1,
    urlUtils,
    userTiming,
    stickyMpu,
    buildPageTargeting,
    commercialFeatures,
    ophanTracking,
    breakoutIFrame,
    PrebidService,
    trackAdLoad,
    geoMostPopular,
    ab,
    beacon,
    id,
    svgs,
    once,
    forOwn,
    debounce,
    contains,
    uniq,
    flatten,
    every,
    map,
    filter,
    chain,
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
     * <div class="js-ad-slot AD_SLOT_CLASS" data-name="AD_SLOT_NAME" data-mobile="300,50|320,50"
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
    var adSlotSelector = '.js-ad-slot';
    var displayed = false;
    var rendered = false;
    var creativeIDs = [];
    var prebidService = null;
    var advertsToLoad = [];
    var adSlotIds = {};
    var dfp;
    var adSlots;
    var googletag;

    var renderStartTime = null;
    var prebidEnabled = config.switches.headerBiddingUs && config.page.edition === 'US';

    /**
     * INIT
     * - Set up dependencies, targeting, and response listeners
     */

    function init() {
        return commercialFeatures.dfpAdvertising ?
            setupAdvertising() :
            fastdom.write(function () {
                bonzo(qwery(adSlotSelector)).remove();
            });
    }

    function setupAdvertising() {
        // if we don't already have googletag, create command queue and load it async
        if (!window.googletag) {
            window.googletag = googletag = { cmd: [] };
            // load the library asynchronously
            require(['js!googletag.js']);
        } else {
            googletag = window.googletag;
        }

        if (prebidEnabled) {
            prebidService = new PrebidService();
        }

        googletag.cmd.push = raven.wrap({ deep: true }, googletag.cmd.push);

        googletag.cmd.push(
            function () {
                renderStartTime = new Date().getTime();
            },
            setListeners,
            setPageTargeting
        );
    }

    function setListeners() {
        ophanTracking.trackPerformance(googletag, renderStartTime);

        var recordFirstAdRendered = once(function () {
            beacon.beaconCounts('ad-render');
        });

        googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(function (event) {
            rendered = true;
            recordFirstAdRendered();

            var adSlot = getAdSlotById(event.slot.getSlotElementId());
            adSlot.isLoading = false;
            adSlot.isLoaded = true;
            adSlot.isRendered = renderAdvert(adSlot, event).then(function (isRendered) {
                mediator.emit('modules:commercial:dfp:rendered', event);
                allAdsRendered();
                return isRendered;
            });
        }));
    }

    function setPageTargeting() {
        var targeting = buildPageTargeting();
        Object.keys(targeting).forEach(function (key) {
            googletag.pubads().setTargeting(key, targeting[key]);
        });
    }

    /**
     * LOAD ADS
     * - Define existing adslots and load adverts
     */
    var lazyLoadEnabled = false;

    function load() {
        if (commercialFeatures.dfpAdvertising) {
            loadAdvertising();
        }
    }

    function loadAdvertising() {
        googletag.cmd.push(
            defineAdSlots,
            setPublisherProvidedId,
            shouldLazyLoad() ? displayLazyAds : displayAds,
            // anything we want to happen after displaying ads
            refreshOnResize
        );
    }

    /**
     * Loop through each slot detected on the page and define it based on the data
     * attributes on the element.
     */
    function defineAdSlots() {
        // Get all ad slots
        adSlots = qwery(adSlotSelector).map(initAdSlot);

        // queue ads for load
        adSlots.forEach(queueAdSlot);
    }

    function setPublisherProvidedId() {
        var user = id.getUserFromCookie();
        if (user) {
            var hashedId = sha1.hash(user.id);
            googletag.pubads().setPublisherProvidedId(hashedId);
        }
    }

    /**
     * LOAD ADS
     */

    function shouldLazyLoad() {
        // We do not want lazy loading on pageskins because it messes up the roadblock
        return !config.page.hasPageSkin;
    }

    /**
     * LOAD ADS: LAZY PATH
     */

    function displayLazyAds() {
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        instantLoad();
        enableLazyLoad();

        function instantLoad() {
            var advertsToInstantlyLoad = [
                'dfp-ad--pageskin-inread',
                'dfp-ad--merchandising-high',
                'dfp-ad--im'
            ];
            advertsToLoad
                .filter(function (_) {
                    return advertsToInstantlyLoad.indexOf(_.id) > -1;
                })
                .forEach(loadAdvert);
        }
    }

    var nbOfFrames = 6;
    var durationOfFrame = 16;
    var depthOfScreen = 1.5;
    var lazyLoad = throttle(function () {
        if (advertsToLoad.length === 0) {
            disableLazyLoad();
        } else {
            var viewportHeight = detect.getViewport().height;

            fastdom.read(function () {
                advertsToLoad
                    .filter(function (advert) {
                        var rect = advert.node.getBoundingClientRect();
                        // load the ad only if it's setting within an acceptable range
                        return (1 - depthOfScreen) * viewportHeight < rect.bottom && advert.node.getBoundingClientRect().top < viewportHeight * depthOfScreen;
                    })
                    .forEach(loadAdvert);
            });
        }
    }, nbOfFrames * durationOfFrame);

    function enableLazyLoad() {
        if (!lazyLoadEnabled) {
            lazyLoadEnabled = true;
            window.addEventListener('scroll', lazyLoad);
            lazyLoad();
        }
    }

    function disableLazyLoad() {
        lazyLoadEnabled = false;
        window.removeEventListener('scroll', lazyLoad);
    }

    /**
     * LOAD ADS: NON-LAZY PATH
     */

    function displayAds() {
        googletag.pubads().enableSingleRequest();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        // as this is an single request call, only need to make a single display call (to the first ad
        // slot)
        loadAdvert(advertsToLoad[0]);
        advertsToLoad.length = 0;
    }

    /**
     * ADD SLOT
     */

    function addSlot(adSlot) {
        adSlot = adSlot instanceof HTMLElement ? adSlot : adSlot[0];
        function displayAd (adSlot) {
            adSlot = initAdSlot(adSlot);
            adSlots.push(adSlot);
            queueAdSlot(adSlot);
            if (shouldLazyLoad()) {
                enableLazyLoad();
            } else {
                renderAdvert(adSlot);
            }
        }

        if (displayed && !adSlotIds[adSlot.id]) { // dynamically add ad slot
            // this is horrible, but if we do this before the initial ads have loaded things go awry
            if (rendered) {
                displayAd(adSlot);
            } else {
                mediator.once('modules:commercial:dfp:rendered', function () {
                    displayAd(adSlot);
                });
            }
        }
    }

    function queueAdSlot(adSlot, index) {
        // filter out (and remove) hidden ads
        if (shouldFilterAdSlot(adSlot.node)) {
            fastdom.write(function () {
                bonzo(adSlot.node).remove();
                adSlot.node = null;
            });
            adSlot.isHidden = true;
        } else {
            adSlot.sizes = getAdBreakpointSizes(adSlot);
            adSlot.slot = defineSlot(adSlot.node, adSlot.sizes);
            advertsToLoad.push(adSlot);
            // Add to the array of ads to be refreshed (when the breakpoint changes)
            // only if it's `data-refresh` attribute isn't set to false.
            if (adSlot.node.getAttribute('data-refresh') !== 'false') {
                adSlotsToRefresh.push(adSlot);
            }
        }
        adSlotIds[adSlot.id] = index === undefined ? adSlots.length - 1 : index;

        function shouldFilterAdSlot(adSlot) {
            return isVisuallyHidden(adSlot) || isDisabledCommercialFeature(adSlot);
        }

        function isVisuallyHidden(adSlot) {
            return getComputedStyle(adSlot).display === 'none';
        }

        function isDisabledCommercialFeature(adSlot) {
            return !commercialFeatures.topBannerAd &&
                adSlot.getAttribute('data-name') === 'top-above-nav';
        }
    }

    function loadAdvert(adSlot) {
        adSlot.isLoading = true;
        advertsToLoad.splice(advertsToLoad.indexOf(adSlot), 1);

        if (shouldPrebidAdvert(adSlot)) {
            prebidService.loadAdvert(adSlot).then(function onDisplay() {
                displayed = true;
            });
        } else {
            googletag.display(adSlot.id);
            displayed = true;
        }
    }

    function shouldPrebidAdvert(adSlot) {
        var excludedAdSlotIds = [
            'dfp-ad--pageskin-inread',
            'dfp-ad--merchandising-high'
        ];
        return prebidEnabled && shouldLazyLoad() && excludedAdSlotIds.indexOf(adSlot.id) > -1;
    }

    /**
     * REFRESH ON WINDOW RESIZE
     */

    var adSlotsToRefresh = [];
    var hasBreakpointChanged = detect.hasCrossedBreakpoint(true);

    var resizeTimeout = 2000;
    var windowResize = debounce(
        function () {
            // refresh on resize
            hasBreakpointChanged(refresh);
        }, resizeTimeout
    );

    function refreshOnResize() {
        mediator.on('window:resize', windowResize);
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

    function getSlotsBreakpoint(breakpoint, slotBreakpoints) {
        return chain(detect.breakpoints).and(initial, function (breakpointInfo) {
            return breakpointInfo.name !== breakpoint;
        }).and(intersection, slotBreakpoints).and(last).value();
    }

    /**
     * PARSE RETURNED ADVERTS
     */

    var callbacks = {
        '0,0': isFluid250('ad-slot--top-banner-ad'),
        '300,251': function (_, adSlot) {
            stickyMpu(bonzo(adSlot.node));
        },
        '300,250': function (_, adSlot) {
            if (adSlot.node.classList.contains('ad-slot--right')) {
                var mobileAdSizes = adSlot.sizes('data-mobile');
                if (adSlot.sizes.mobile && adSlots.sizes.indexOf([300, 251]) > -1) {
                    stickyMpu(bonzo(adSlot.node));
                }
            }
        },
        '1,1': function (event, adSlot) {
            if (!event.slot.getOutOfPage()) {
                adSlot.node.classList.add('u-h');
                var parent = adSlot.node.parentNode;
                // if in a slice, add the 'no mpu' class
                if (parent.classList.contains('js-fc-slice-mpu-candidate')) {
                    parent.classList.add('fc-slice__item--no-mpu');
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
        },
        '88,70': isFluid250('ad-slot--top-banner-ad'),
        '88,71': isFluid('ad-slot--mobile'),
        '88,88': isFluid250('ad-slot--commercial-component')
    };

    function isFluid250(className) {
        return function (_, adSlot) {
            if (adSlot.node.classList.contains(className)) {
                fastdom.write(function () {
                    adSlot.node.classList.add('ad-slot__fluid250');
                });
            }
        };
    }

    function isFluid(className) {
        return function (_, adSlot) {
            if (adSlot.node.classList.contains(className)) {
                fastdom.write(function () {
                    adSlot.node.classList.add('ad-slot--fluid');
                });
            }
        };
    }

    function renderAdvert(adSlot, event) {
        if (event.isEmpty) {
            // This empty slot could be caused by a targeting problem,
            // let's report these and diagnose the problem in sentry.
            // Keep the sample rate low, otherwise we'll get rate-limited (report-error will also sample down)
            if (config.switches.reportEmptyDfpResponses && Math.random() < 0.001) {
                var adUnitPath = event.slot.getAdUnitPath();
                var adTargetingMap = event.slot.getTargetingMap();
                var adTargetingKValues = adTargetingMap ? adTargetingMap['k'] : [];
                var adKeywords = adTargetingKValues ? adTargetingKValues.join(', ') : '';

                reportError(new Error('dfp returned an empty ad response'), {
                    feature: 'commercial',
                    adUnit: adUnitPath,
                    adSlot: adSlot.id,
                    adKeywords: adKeywords
                }, false);
            }

            return fastdom.write(function () {
                googletag.destroySlots([adSlot.slot]);
                bonzo(adSlot.node).remove();
                adSlot.node = adSlot.slot = null;
                return false;
            });
        } else {
            // Store ads IDs for technical feedback
            creativeIDs.push(event.creativeId);

            // remove any placeholder ad content
            fastdom.write(function () {
                bonzo(qwery('.ad-slot__content--placeholder', adSlot.node)).remove();
                bonzo(qwery('div', adSlot.node)).addClass('ad-slot__content');
            });

            // Check if creative is a new gu style creative and place labels accordingly.
            // Use public method so that tests can stub it out.
            return dfp.checkForBreakout(adSlot.node).then(function (isRendered) {
                addLabel(adSlot.node);

                var size = event.size.join(',');
                // is there a callback for this size
                if (callbacks[size]) {
                    callbacks[size](event, adSlot);
                }

                return isRendered;
            }).catch(raven.captureException);
        }
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
    function checkForBreakout($adSlot) {
        return new Promise(function (resolve, reject) {
            // DFP sometimes sends back two iframes, one with actual ad and one with 0,0 sizes and __hidden__ 'paramter'
            // The later one will never go to 'complete' state on IE so lets avoid it.
            var iFrame = find($('iframe', $adSlot), function (iframe) { return iframe.id.match('__hidden__') === null; });

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
                        resolve(breakoutIFrame(updatedIFrame, $adSlot));
                    }
                });
            } else {
                resolve(breakoutIFrame(iFrame, $adSlot));
            }
        });
    }

    function addLabel(adSlotNode) {
        fastdom.write(function () {
            if (shouldRenderLabel(adSlotNode)) {
                adSlotNode.insertAdjacentHTML('afterbegin', '<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            }
        });
    }

    function shouldRenderLabel(adSlotNode) {
        return !adSlotNode.classList.contains('ad-slot--frame') &&
            !adSlotNode.classList.contains('gu-style') &&
            !adSlotNode.querySelector('.ad-slot__label') &&
            adSlotNode.getAttribute('data-label') !== 'false';
    }

    function allAdsRendered() {
        if (adSlots.every(function (_) { return _.isRendered || _.isHidden; })) {
            userTiming.mark('All ads are rendered');
            mediator.emit('modules:commercial:dfp:alladsrendered');
        }
    }

    /**
     * USER FEEDBACK
     */

    function getCreativeIDs() {
        return creativeIDs;
    }

    /**
     * ADVERT DOMAIN OBJECTS
     */

    function getAdSlotById(id) {
        return adSlots[adSlotIds[id]];
    }

    function getAdSlots() {
        return Object.keys(adSlotIds).reduce(function (adSlotsById, id) {
            adSlotsById[id] = getAdSlotById(id);
            return adSlotsById;
        }, {});
    }

    function initAdSlot(adSlotNode) {
        return Object.seal({
            id: adSlotNode.id,
            isHidden: false,
            isLoading: false,
            isLoaded: false,
            isRendered: false,
            node: adSlotNode,
            sizes: null,
            slot: null
        });
    }

    /** A breakpoint can have various sizes assigned to it. You can assign either on
     * set of sizes or multiple.
     *
     * One size       - `data-mobile="300,50"`
     * Multiple sizes - `data-mobile="300,50|320,50"`
     */
    function createSizeMapping(attr) {
        return attr.split('|').map(function (size) {
            return size === 'fluid' ? 'fluid' : size.split(',').map(Number);
        });
    }

    function defineSlot($adSlot, sizes) {
        var slotTarget = $adSlot.data('slot-target') || $adSlot.data('name');
        var adUnitOverride = urlUtils.getUrlVars()['ad-unit'];
        // if ?ad-unit=x, use that
        var adUnit = adUnitOverride ?
            ['/', config.page.dfpAccountId, '/', adUnitOverride].join('')
            : config.page.adUnit;
        var id             = $adSlot.attr('id');
        var slot;
        var size;
        var sizeMapping;

        if ($adSlot.data('out-of-page')) {
            slot = googletag.defineOutOfPageSlot(adUnit, id);
        } else {
            sizeMapping = buildSizeMapping(sizes);
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
    function buildSizeMapping(sizes) {
        var mapping = googletag.sizeMapping();

        detect.breakpoints
            .filter(function (_) { return _.name in sizes; })
            .forEach(function (_) {
                mapping.addSize([_.width, 0], sizes[_.name]);
            });

        return mapping.build();
    }

    function parseKeywords(keywords) {
        return (keywords || '').split(',').map(function (keyword) {
            return keyword.substr(keyword.lastIndexOf('/') + 1);
        });
    }

    /**
     * Module
     */

    dfp = {
        init:           init,
        loadAds:        load,
        addSlot:        addSlot,
        getCreativeIDs: getCreativeIDs,
        trackAdLoad:    trackAdLoad,

        // Used privately but exposed only for unit testing
        getAdverts:     getAdSlots,
        shouldLazyLoad: shouldLazyLoad,
        checkForBreakout: checkForBreakout,

        // testing
        reset: function () {
            displayed = false;
            rendered = false;
            adSlots = [];
            adSlotIds = {};
            adSlotsToRefresh = [];
            mediator.off('window:resize', windowResize);
            hasBreakpointChanged = detect.hasCrossedBreakpoint(true);
        }
    };

    return dfp;

});
