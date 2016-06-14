// Be wary of renaming this file; some titles, like 'dfp.js',
// can trigger adblocker rules, and make the module fail to load in dev.

define([
    'bean',
    'bonzo',
    'qwery',
    'Promise',
    'raven',
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
    'common/modules/onward/geo-most-popular',
    'common/modules/analytics/beacon',
    'common/modules/identity/api',
    'lodash/functions/once',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'lodash/functions/memoize',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten'
], function (
    bean,
    bonzo,
    qwery,
    Promise,
    raven,
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
    geoMostPopular,
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
            advert.isLoading = false;
            advert.isRendering = true;
            advert.whenLoadedResolver(true);
            renderAdvert(advert, event).then(function (isRendered) {
                advert.isRendering = false;
                advert.whenRenderedResolver(isRendered);
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

    function load() {
        if (commercialFeatures.dfpAdvertising) {
            loadAdvertising();
        }
    }

    function loadAdvertising() {
        googletag.cmd.push(
            defineAdverts,
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
    function defineAdverts() {
        // Get all ad slots
        adverts = qwery(adSlotSelector).map(initAdvert);

        // queue ads for load
        adverts.forEach(queueAdvert);
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
            var advert = initAdvert(adSlot);
            adverts.push(advert);
            queueAdvert(advert);
            if (shouldLazyLoad()) {
                enableLazyLoad();
            } else {
                renderAdvert(advert);
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

    function queueAdvert(advert, index) {
        // filter out (and remove) hidden ads
        if (shouldFilterAdSlot(advert.node)) {
            fastdom.write(function () {
                bonzo(advert.node).remove();
                advert.node = null;
            });
            advert.isHidden = true;
        } else {
            advert.sizes = getAdBreakpointSizes(advert);
            advert.slot = defineSlot(advert.node, advert.sizes);
            advert.whenLoaded = new Promise(function (resolve) {
                advert.whenLoadedResolver = resolve;
            });
            advert.whenRendered = new Promise(function (resolve) {
                advert.whenRenderedResolver = resolve;
            });
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
        advert.isLoading = true;
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
        return prebidEnabled && shouldLazyLoad() && excludedadvertIds.indexOf(advert.id) > -1;
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
        googletag.pubads().refresh(advertsToRefresh.filter(shouldRefresh));

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
     * PARSE RETURNED ADVERTS
     */

    var callbacks = {
        '0,0': isFluid250('ad-slot--top-banner-ad'),
        '300,251': function (_, advert) {
            stickyMpu(bonzo(advert.node));
        },
        '300,250': function (_, advert) {
            if (advert.node.classList.contains('ad-slot--right')) {
                var mobileAdSizes = advert.sizes('data-mobile');
                if (mobileAdSizes && mobileAdSizes.indexOf([300, 251]) > -1) {
                    stickyMpu(bonzo(advert.node));
                }
            }
        },
        '1,1': function (event, advert) {
            if (!event.slot.getOutOfPage()) {
                advert.node.classList.add('u-h');
                var parent = advert.node.parentNode;
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

    function renderAdvert(advert, event) {
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
                    adSlot: advert.id,
                    adKeywords: adKeywords
                }, false);
            }

            return fastdom.write(function () {
                googletag.destroySlots([advert.slot]);
                bonzo(advert.node).remove();
                advert.node = advert.slot = null;
                return false;
            });
        } else {
            // Store ads IDs for technical feedback
            creativeIDs.push(event.creativeId);

            // remove any placeholder ad content
            fastdom.write(function () {
                bonzo(qwery('.ad-slot__content--placeholder', advert.node)).remove();
                bonzo(qwery('div', advert.node)).addClass('ad-slot__content');
            });

            // Check if creative is a new gu style creative and place labels accordingly.
            // Use public method so that tests can stub it out.
            return dfp.checkForBreakout(advert.node).then(function (isRendered) {
                addLabel(advert.node);

                var size = event.size.join(',');
                // is there a callback for this size
                if (callbacks[size]) {
                    callbacks[size](event, advert);
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
    function checkForBreakout(adSlotNode) {
        return new Promise(function (resolve, reject) {
            // DFP sometimes sends back two iframes, one with actual ad and one with 0,0 sizes and __hidden__ 'paramter'
            // The later one will never go to 'complete' state on IE so lets avoid it.
            var iFrame = adSlotNode.querySelector('iframe:not([id*="__hidden__"])');

            // No iFrame, no work to do
            if (iFrame === null) {
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
                        resolve(breakoutIFrame(updatedIFrame, adSlotNode));
                    }
                });
            } else {
                resolve(breakoutIFrame(iFrame, adSlotNode));
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
        if (adverts.every(function (_) { return _.isRendered || _.isHidden; })) {
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
        return new Promise(function (resolve, reject) {
            var failedAttempts = 5;
            checkAdvert();
            function checkAdvert() {
                var advert = getAdvertById(id);
                if (!advert) {
                    failedAttempts -= 1;
                    if (failedAttempts === 0) {
                        reject(new Error('Ad ' + id + ' failed to load'));
                    }
                    window.setTimeout(checkAdvert, 100);
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

    function getAdverts(withHidden) {
        return Object.keys(advertIds).reduce(function (advertsById, id) {
            var advert = getAdvertById(id);
            if (withHidden || !advert.isHidden) {
                advertsById[id] = advert;
            }
            return advertsById;
        }, {});
    }

    function initAdvert(adSlotNode) {
        return Object.seal({
            id: adSlotNode.id,
            isHidden: false,
            isLoading: false,
            isRendering: false,
            whenLoaded: null,
            whenLoadedResolver: null,
            whenRendered: null,
            whenRenderedResolver: null,
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
        checkForBreakout: checkForBreakout,

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
