// Be wary of renaming this file; some titles, like 'dfp.js',
// can trigger adblocker rules, and make the module fail to load in dev.

define([
    'bonzo',
    'qwery',
    'Promise',
    'raven',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'common/utils/report-error',
    'common/utils/sha1',
    'common/utils/url',
    'common/utils/user-timing',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp/ophan-tracking',
    'common/modules/commercial/dfp/apply-creative-template',
    'common/modules/commercial/dfp/PrebidService',
    'common/modules/commercial/dfp/render-advert',
    'common/modules/analytics/beacon',
    'common/modules/identity/api',
    'lodash/functions/once',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'lodash/functions/memoize',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten'
], function (
    bonzo,
    qwery,
    Promise,
    raven,
    config,
    detect,
    fastdom,
    mediator,
    reportError,
    sha1,
    urlUtils,
    userTiming,
    buildPageTargeting,
    commercialFeatures,
    ophanTracking,
    applyCreativeTemplate,
    PrebidService,
    renderAdvert,
    beacon,
    id,
    once,
    debounce,
    throttle,
    memoize,
    uniq,
    flatten
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
    var advertsToRefresh = [];
    var advertIds = {};
    var dfp;
    var adverts;
    var googletag;

    var renderStartTime = null;
    var prebidEnabled = config.switches.headerBiddingUs && config.page.edition === 'US';

    /**
     * INIT
     * - Set up dependencies, targeting, and response listeners
     */

    function init() {
        if (commercialFeatures.dfpAdvertising) {
            setupAdvertising();
            return Promise.resolve();
        }

        return fastdom.write(function () {
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

            var advert = getAdvertById(event.slot.getSlotElementId());
            stopLoadingAdvert(advert, true);
            startRenderingAdvert(advert);

            if (event.isEmpty) {
                emptyAdvert(advert);
                reportEmptyResponse(advert.id, event);
                emitRenderEvents(false);
            } else {
                creativeIDs.push(event.creativeId);
                renderAdvert(advert, event)
                .then(emitRenderEvents);
            }

            function emitRenderEvents(isRendered) {
                stopRenderingAdvert(advert, isRendered);
                mediator.emit('modules:commercial:dfp:rendered', event);
                allAdsRendered();
            }
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

    function load() {
        if (commercialFeatures.dfpAdvertising) {
            loadAdvertising();
        }
    }

    function loadAdvertising() {
        createAdverts();
        googletag.cmd.push(
            queueAdverts,
            setPublisherProvidedId,
            shouldLazyLoad() ? displayLazyAds : displayAds,
            // anything we want to happen after displaying ads
            refreshOnResize
        );
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

    var lazyLoadEnabled = false;

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
    var loadQueued = false;
    var lazyLoad = throttle(function () {
        if (advertsToLoad.length === 0) {
            disableLazyLoad();
        } else {
            var viewportHeight = detect.getViewport().height;

            if( loadQueued ) {
                return;
            }

            loadQueued = true;
            fastdom.read(function () {
                advertsToLoad
                    .filter(function (advert) {
                        var rect = advert.node.getBoundingClientRect();
                        // load the ad only if it's setting within an acceptable range
                        return (1 - depthOfScreen) * viewportHeight < rect.bottom && advert.node.getBoundingClientRect().top < viewportHeight * depthOfScreen;
                    })
                    .forEach(loadAdvert);
                loadQueued = false;
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
            var advert = createAdvert(adSlot);
            adverts.push(advert);
            queueAdvert(advert);
            if (shouldLazyLoad()) {
                enableLazyLoad();
            } else {
                loadAdvert(advert);
            }
        }

        if (displayed && !advertIds[adSlot.id]) { // dynamically add ad slot
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

    /**
     * REFRESH ON WINDOW RESIZE
     */

    var hasBreakpointChanged = detect.hasCrossedBreakpoint(true);

    var resizeTimeout = 2000;
    var windowResize = debounce(
        function () {
            // refresh on resize
            hasBreakpointChanged(refresh);
        }, resizeTimeout
    );

    function refreshOnResize() {
        window.addEventListener('resize', windowResize);
    }

    function refresh(currentBreakpoint, previousBreakpoint) {
        // only refresh if the slot needs to
        googletag.pubads().refresh(advertsToRefresh.filter(shouldRefresh).map(function (_) { return _.slot; }));

        function shouldRefresh(advert) {
            // get the slot breakpoints
            var slotBreakpoints = Object.keys(advert.sizes);
            // find the currently matching breakpoint
            var currentSlotBreakpoint = getBreakpointIndex(currentBreakpoint, slotBreakpoints);
            // find the previously matching breakpoint
            var previousSlotBreakpoint = getBreakpointIndex(previousBreakpoint, slotBreakpoints);
            return currentSlotBreakpoint !== -1 && currentSlotBreakpoint !== previousSlotBreakpoint;
        }

        function getBreakpointIndex(breakpoint, slotBreakpoints) {
            var breakpointNames = detect.breakpoints.map(function (_) { return _.name; });
            var validBreakpointNames = breakpointNames
                .slice(0, breakpointNames.indexOf(breakpoint) + 1)
                .map(breakpointNameToAttribute);
            return Math.max.apply(Math, slotBreakpoints.map(function (_) {
                return validBreakpointNames.lastIndexOf(_);
            }));
        }
    }

    /**
     * HANDLE RETURNED ADVERTS
     */

    function reportEmptyResponse(adSlotId, event) {
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
                adSlot: adSlotId,
                adKeywords: adKeywords
            }, false);
        }
    }

    function allAdsRendered() {
        if (adverts.every(function (_) { return _.isRendered || _.isEmpty || _.isHidden; })) {
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

    function getAdvertById(id) {
        return id in advertIds ? adverts[advertIds[id]] : null;
    }

    var waitForAdvert = memoize(function (id) {
        return new Promise(function (resolve) {
            checkAdvert();
            function checkAdvert() {
                var advert = getAdvertById(id);
                if (!advert) {
                    window.setTimeout(checkAdvert, 200);
                } else {
                    resolve(advert);
                }
            }
        });
    });

    function trackAdLoad(id) {
        return waitForAdvert(id).then(function (_) { return _.whenLoaded; });
    }

    function trackAdRender(id) {
        return waitForAdvert(id).then(function (_) { return _.whenRendered; });
    }

    function createAdverts() {
        // Get all ad slots
        adverts = qwery(adSlotSelector).map(createAdvert);
    }

    function getAdverts(isWithAllAds) {
        return Object.keys(advertIds).reduce(function (advertsById, id) {
            var advert = getAdvertById(id);
            if (isWithAllAds || (!advert.isHidden && !advert.isEmpty)) {
                advertsById[id] = advert;
            }
            return advertsById;
        }, {});
    }

    function createAdvert(adSlotNode) {
        var advert = {
            id: adSlotNode.id,
            isHidden: false,
            isEmpty: false,
            isLoading: false,
            isRendering: false,
            isLoaded: false,
            isRendered: false,
            whenLoaded: null,
            whenLoadedResolver: null,
            whenRendered: null,
            whenRenderedResolver: null,
            node: adSlotNode,
            sizes: null,
            slot: null
        };
        advert.whenLoaded = new Promise(function (resolve) {
            advert.whenLoadedResolver = resolve;
        }).then(function (isLoaded) {
            advert.isLoaded = isLoaded;
        });
        advert.whenRendered = new Promise(function (resolve) {
            advert.whenRenderedResolver = resolve;
        }).then(function (isRendered) {
            advert.isRendered = isRendered;
        });
        return Object.seal(advert);
    }

    function emptyAdvert(advert) {
        advert.isEmpty = true;
        fastdom.write(function () {
            googletag.destroySlots([advert.slot]);
            bonzo(advert.node).remove();
            advert.node = advert.slot = null;
        });
    }

    function hideAdvert(advert) {
        advert.isHidden = true;
        fastdom.write(function () {
            bonzo(advert.node).remove();
            advert.node = null;
        });
    }

    function startLoadingAdvert(advert) {
        advert.isLoading = true;
    }

    function stopLoadingAdvert(advert, isLoaded) {
        advert.isLoading = false;
        advert.whenLoadedResolver(isLoaded);
    }

    function startRenderingAdvert(advert) {
        advert.isRendering = true;
    }

    function stopRenderingAdvert(advert, isRendered) {
        advert.isRendering = false;
        advert.whenRenderedResolver(isRendered);
    }

    /**
     * Loop through each slot detected on the page and define it based on the data
     * attributes on the element.
     */
    function queueAdverts() {
        // queue ads for load
        adverts.forEach(queueAdvert);
    }

    function queueAdvert(advert, index) {
        // filter out (and remove) hidden ads
        if (shouldFilterAdSlot(advert.node)) {
            hideAdvert(advert);
        } else {
            advert.sizes = getAdBreakpointSizes(advert);
            advert.slot = defineSlot(advert.node, advert.sizes);
            advertsToLoad.push(advert);
            // Add to the array of ads to be refreshed (when the breakpoint changes)
            // only if its `data-refresh` attribute isn't set to false.
            if (advert.node.getAttribute('data-refresh') !== 'false') {
                advertsToRefresh.push(advert);
            }
        }
        advertIds[advert.id] = index === undefined ? adverts.length - 1 : index;

        function shouldFilterAdSlot(adSlotNode) {
            return isVisuallyHidden(adSlotNode) || isDisabledCommercialFeature(adSlotNode);
        }

        function isVisuallyHidden(adSlotNode) {
            return getComputedStyle(adSlotNode).display === 'none';
        }

        function isDisabledCommercialFeature(adSlotNode) {
            return !commercialFeatures.topBannerAd &&
                adSlotNode.getAttribute('data-name') === 'top-above-nav';
        }
    }

    function loadAdvert(advert) {
        startLoadingAdvert(advert);
        advertsToLoad.splice(advertsToLoad.indexOf(advert), 1);

        if (shouldPrebidAdvert(advert)) {
            prebidService.loadAdvert(advert).then(function onDisplay() {
                displayed = true;
            });
        } else {
            googletag.display(advert.id);
            displayed = true;
        }
    }

    function shouldPrebidAdvert(advert) {
        var excludedadvertIds = [
            'dfp-ad--pageskin-inread',
            'dfp-ad--merchandising-high'
        ];
        return prebidEnabled && shouldLazyLoad() && excludedadvertIds.indexOf(advert.id) === -1;
    }

    /** A breakpoint can have various sizes assigned to it. You can assign either on
     * set of sizes or multiple.
     *
     * One size       - `data-mobile="300,50"`
     * Multiple sizes - `data-mobile="300,50|320,50"`
     */
    function getAdBreakpointSizes(advert) {
        return detect.breakpoints.reduce(function (sizes, breakpoint) {
            var data = advert.node.getAttribute('data-' + breakpointNameToAttribute(breakpoint.name));
            if (data) {
                sizes[breakpoint.name] = createSizeMapping(data);
            }
            return sizes;
        }, {});

        function createSizeMapping(attr) {
            return attr.split('|').map(function (size) {
                return size === 'fluid' ? 'fluid' : size.split(',').map(Number);
            });
        }
    }

    function breakpointNameToAttribute(breakpointName) {
        return breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    function defineSlot(adSlotNode, sizes) {
        var slotTarget = adSlotNode.getAttribute('data-slot-target') || adSlotNode.getAttribute('data-name');
        var adUnitOverride = urlUtils.getUrlVars()['ad-unit'];
        // if ?ad-unit=x, use that
        var adUnit = adUnitOverride ?
            '/' + config.page.dfpAccountId + '/' + adUnitOverride :
            config.page.adUnit;
        var id = adSlotNode.id;
        var slot;
        var size;
        var data;
        var sizeMapping;

        if (adSlotNode.getAttribute('data-out-of-page')) {
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

        data = adSlotNode.getAttribute('data-series');
        if (data) {
            slot.setTargeting('se', parseKeywords(data));
        }

        data = adSlotNode.getAttribute('data-keywords');
        if (data) {
            slot.setTargeting('k', parseKeywords(data));
        }

        slot.addService(googletag.pubads())
            .setTargeting('slot', slotTarget);

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
        trackAdRender:  trackAdRender,

        // Used privately but exposed only for unit testing
        getAdverts:     getAdverts,
        shouldLazyLoad: shouldLazyLoad,

        // testing
        reset: function () {
            displayed = false;
            rendered = false;
            adverts = [];
            advertIds = {};
            advertsToRefresh = [];
            mediator.off('window:resize', windowResize);
            hasBreakpointChanged = detect.hasCrossedBreakpoint(true);
        }
    };

    return dfp;

});
