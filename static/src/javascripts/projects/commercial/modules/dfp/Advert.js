import { breakpoints } from 'lib/detect';
import { getCurrentTime } from 'lib/user-timing';
import { defineSlot } from 'commercial/modules/dfp/define-slot';
import { breakpointNameToAttribute } from 'commercial/modules/dfp/breakpoint-name-to-attribute';


/** A breakpoint can have various sizes assigned to it. You can assign either on
 * set of sizes or multiple.
 *
 * One size       - `data-mobile="300,50"`
 * Multiple sizes - `data-mobile="300,50|320,50"`
 */
const createSizeMapping = (attr) =>
    attr
        .split('|')
        .map(size =>
            size === 'fluid' ? 'fluid' : size.split(',').map(Number)
        );

const getAdBreakpointSizes = (advertNode) =>
    breakpoints.reduce((sizes, breakpoint) => {
        const data = advertNode.getAttribute(
            `data-${breakpointNameToAttribute(breakpoint.name)}`
        );
        if (data) {
            sizes[breakpoint.name] = createSizeMapping(data);
        }
        return sizes;
    }, {});

class Advert {
    id;
    node;
    sizes;
    size;
    slot;
    isEmpty;
    isLoading;
    isRendering;
    isLoaded;
    isRendered;
    shouldRefresh;
    maxViewPercentage;
    whenLoaded;
    whenLoadedResolver;
    whenRendered;
    whenRenderedResolver;
    whenSlotReady;
    extraNodeClasses;
    timings;
    hasPrebidSize;

    constructor(adSlotNode) {
        const sizes = getAdBreakpointSizes(adSlotNode);
        const slotDefinition = defineSlot(adSlotNode, sizes);

        this.id = adSlotNode.id;
        this.node = adSlotNode;
        this.sizes = sizes;
        this.size = null;
        this.slot = slotDefinition.slot;
        this.isEmpty = null;
        this.isLoading = false;
        this.isRendering = false;
        this.isLoaded = false;
        this.isRendered = false;
        this.whenSlotReady = slotDefinition.slotReady;
        this.timings = {
            createTime: null,
            startLoading: null,
            stopLoading: null,
            startRendering: null,
            stopRendering: null,
            loadingMethod: null,
            lazyWaitComplete: null,
        };
        this.shouldRefresh = false;
        this.maxViewPercentage = 0;
        this.hasPrebidSize = false;

        this.whenLoaded = new Promise(resolve => {
            this.whenLoadedResolver = resolve;
        }).then(
            (isLoaded) => {
                this.isLoaded = isLoaded;
                return isLoaded;
            }
        );

        this.whenRendered = new Promise(resolve => {
            this.whenRenderedResolver = resolve;
        }).then(
            (isRendered) => {
                this.isRendered = isRendered;
                return isRendered;
            }
        );

        this.extraNodeClasses = [];
    }

    startLoading() {
        this.isLoading = true;
        this.timings.startLoading = getCurrentTime();
    }

    stopLoading(isLoaded) {
        this.isLoading = false;
        if (this.whenLoadedResolver) {
            this.whenLoadedResolver(isLoaded);
        }
        this.timings.stopLoading = getCurrentTime();
    }

    startRendering() {
        this.isRendering = true;
        this.timings.startRendering = getCurrentTime();
    }

    stopRendering(isRendered) {
        this.isRendering = false;
        if (this.whenRenderedResolver) {
            this.whenRenderedResolver(isRendered);
        }
    }

    static filterClasses = (
        oldClasses,
        newClasses
    ) =>
        oldClasses.filter(oldClass => !newClasses.includes(oldClass));

    updateExtraSlotClasses(...newClasses) {
        const classesToRemove = Advert.filterClasses(
            this.extraNodeClasses,
            newClasses
        );
        this.node.classList.remove(...classesToRemove);
        this.node.classList.add(...newClasses);
        this.extraNodeClasses = newClasses;
    }
}

export { Advert };

export const _ = {
    filterClasses: Advert.filterClasses,
};
