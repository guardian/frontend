import detect from 'lib/detect';
import userTiming from 'lib/user-timing';
import defineSlot from 'commercial/modules/dfp/define-slot';
import performanceLogging from 'commercial/modules/dfp/performance-logging';
import breakpointNameToAttribute from 'commercial/modules/dfp/breakpoint-name-to-attribute';
Advert.startLoading = startLoading;
Advert.stopLoading = stopLoading;
Advert.startRendering = startRendering;
Advert.stopRendering = stopRendering;
export default Advert;

function Advert(adSlotNode) {
    var sizes = getAdBreakpointSizes(adSlotNode);
    var slotDefinition = defineSlot.defineSlot(adSlotNode, sizes);
    var advert = {
        id: adSlotNode.id,
        node: adSlotNode,
        sizes: sizes,
        size: null,
        slot: slotDefinition.slot,
        isEmpty: null,
        isLoading: false,
        isRendering: false,
        isLoaded: false,
        isRendered: false,
        whenLoaded: null,
        whenLoadedResolver: null,
        whenRendered: null,
        whenRenderedResolver: null,
        whenSlotReady: slotDefinition.slotReady,
        timings: {
            createTime: null,
            startLoading: null,
            stopLoading: null,
            startRendering: null,
            stopRendering: null,
            loadingMethod: null,
            lazyWaitComplete: null
        }
    };
    advert.whenLoaded = new Promise(function(resolve) {
        advert.whenLoadedResolver = resolve;
    }).then(function(isLoaded) {
        return advert.isLoaded = isLoaded;
    });
    advert.whenRendered = new Promise(function(resolve) {
        advert.whenRenderedResolver = resolve;
    }).then(function(isRendered) {
        return advert.isRendered = isRendered;
    });

    performanceLogging.updateAdvertMetric(advert, 'createTime', userTiming.getCurrentTime());

    return Object.seal(advert);
}

function getAdBreakpointSizes(advertNode) {
    return detect.breakpoints.reduce(function(sizes, breakpoint) {
        var data = advertNode.getAttribute('data-' + breakpointNameToAttribute(breakpoint.name));
        if (data) {
            sizes[breakpoint.name] = createSizeMapping(data);
        }
        return sizes;
    }, {});
}

/** A breakpoint can have various sizes assigned to it. You can assign either on
 * set of sizes or multiple.
 *
 * One size       - `data-mobile="300,50"`
 * Multiple sizes - `data-mobile="300,50|320,50"`
 */
function createSizeMapping(attr) {
    return attr.split('|').map(function(size) {
        return size === 'fluid' ? 'fluid' : size.split(',').map(Number);
    });
}

function startLoading(advert) {
    advert.isLoading = true;
    advert.timings.startLoading = userTiming.getCurrentTime();
}

function stopLoading(advert, isLoaded) {
    advert.isLoading = false;
    advert.whenLoadedResolver(isLoaded);
    advert.timings.stopLoading = userTiming.getCurrentTime();
}

function startRendering(advert) {
    advert.isRendering = true;
    advert.timings.startRendering = userTiming.getCurrentTime();
}

function stopRendering(advert, isRendered) {
    advert.isRendering = false;
    advert.whenRenderedResolver(isRendered);
    performanceLogging.updateAdvertMetric(advert, 'stopRendering', userTiming.getCurrentTime());
}
