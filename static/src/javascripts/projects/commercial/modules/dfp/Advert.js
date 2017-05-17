// @flow
import detect from 'lib/detect';
import { getCurrentTime } from 'lib/user-timing';
import { defineSlot } from 'commercial/modules/dfp/define-slot';
import { updateAdvertMetric } from 'commercial/modules/dfp/performance-logging';
import breakpointNameToAttribute
    from 'commercial/modules/dfp/breakpoint-name-to-attribute';

/** A breakpoint can have various sizes assigned to it. You can assign either on
 * set of sizes or multiple.
 *
 * One size       - `data-mobile="300,50"`
 * Multiple sizes - `data-mobile="300,50|320,50"`
 */
const createSizeMapping = (attr: string) =>
    attr
        .split('|')
        .map(
            size => (size === 'fluid' ? 'fluid' : size.split(',').map(Number))
        );

const getAdBreakpointSizes = (advertNode: Element): {} =>
    detect.breakpoints.reduce((sizes, breakpoint) => {
        const data = advertNode.getAttribute(`data-${breakpointNameToAttribute(breakpoint.name)}`);
        if (data) {
            sizes[breakpoint.name] = createSizeMapping(data);
        }
        return sizes;
    }, {});

type Resolver = (x: boolean) => void;

class Advert {
    startLoading: any;
    stopLoading: any;
    startRendering: any;
    stopRendering: any;
    id: string;
    node: Element;
    sizes: {};
    size: ?any;
    slot: any;
    isEmpty: ?boolean;
    isLoading: boolean;
    isRendering: boolean;
    isLoaded: boolean;
    isRendered: boolean;
    whenLoaded: Promise<boolean>;
    whenLoadedResolver: Resolver;
    whenRendered: Promise<boolean>;
    whenRenderedResolver: Resolver;
    whenSlotReady: Promise<void>;
    timings: {
        createTime: ?number,
        startLoading: ?number,
        stopLoading: ?number,
        startRendering: ?number,
        stopRendering: ?number,
        loadingMethod: ?number,
        lazyWaitComplete: ?number,
    };

    constructor(adSlotNode: Element) {
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

        this.whenLoaded = new Promise(resolve => {
            this.whenLoadedResolver = resolve;
        }).then((isLoaded: boolean) => (this.isLoaded = isLoaded));

        this.whenRendered = new Promise(resolve => {
            this.whenRenderedResolver = resolve;
        }).then((isRendered: boolean) => (this.isRendered = isRendered));

        this.startLoading = () => {
            this.isLoading = true;
            this.timings.startLoading = getCurrentTime();
        };

        this.stopLoading = (isLoaded: boolean) => {
            this.isLoading = false;
            if (this.whenLoadedResolver) {
                this.whenLoadedResolver(isLoaded);
            }
            this.timings.stopLoading = getCurrentTime();
        };

        this.startRendering = () => {
            this.isRendering = true;
            this.timings.startRendering = getCurrentTime();
        };

        this.stopRendering = (isRendered: boolean) => {
            this.isRendering = false;
            if (this.whenRenderedResolver) {
                this.whenRenderedResolver(isRendered);
            }
            updateAdvertMetric(this, 'stopRendering', getCurrentTime());
        };

        updateAdvertMetric(this, 'createTime', getCurrentTime());
    }
}

export { Advert };
