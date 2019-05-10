// @flow
import type { AdSize, AdSizes } from 'commercial/types';

import { breakpoints } from 'lib/detect';
import { getCurrentTime } from 'lib/user-timing';
import { defineSlot } from 'commercial/modules/dfp/define-slot';
import { breakpointNameToAttribute } from 'commercial/modules/dfp/breakpoint-name-to-attribute';

type Resolver = (x: boolean) => void;

/** A breakpoint can have various sizes assigned to it. You can assign either on
 * set of sizes or multiple.
 *
 * One size       - `data-mobile="300,50"`
 * Multiple sizes - `data-mobile="300,50|320,50"`
 */
const createSizeMapping = (attr: string): Array<AdSize> =>
    attr
        .split('|')
        .map(size =>
            size === 'fluid' ? 'fluid' : size.split(',').map(Number)
        );

const getAdBreakpointSizes = (advertNode: HTMLElement): AdSizes =>
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
    id: string;
    node: HTMLElement;
    sizes: AdSizes;
    size: ?AdSize;
    slot: any;
    isEmpty: ?boolean;
    isLoading: boolean;
    isRendering: boolean;
    isLoaded: boolean;
    isRendered: boolean;
    shouldRefresh: boolean;
    maxViewPercentage: number;
    whenLoaded: Promise<boolean>;
    whenLoadedResolver: Resolver;
    whenRendered: Promise<boolean>;
    whenRenderedResolver: Resolver;
    whenSlotReady: Promise<void>;
    extraNodeClasses: Array<string>;
    timings: {
        createTime: ?number,
        startLoading: ?number,
        stopLoading: ?number,
        startRendering: ?number,
        stopRendering: ?number,
        loadingMethod: ?number,
        lazyWaitComplete: ?number,
    };
    hasPrebidSize: boolean;

    constructor(adSlotNode: HTMLElement) {
        const sizes: AdSizes = getAdBreakpointSizes(adSlotNode);
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
            (isLoaded: boolean): boolean => {
                this.isLoaded = isLoaded;
                return isLoaded;
            }
        );

        this.whenRendered = new Promise(resolve => {
            this.whenRenderedResolver = resolve;
        }).then(
            (isRendered: boolean): boolean => {
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

    stopLoading(isLoaded: boolean) {
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

    stopRendering(isRendered: boolean) {
        this.isRendering = false;
        if (this.whenRenderedResolver) {
            this.whenRenderedResolver(isRendered);
        }
    }

    static filterClasses = (
        oldClasses: Array<string>,
        newClasses: Array<string>
    ): Array<string> =>
        oldClasses.filter(oldClass => !newClasses.includes(oldClass));

    updateExtraSlotClasses(...newClasses: Array<string>): void {
        const classesToRemove: Array<string> = Advert.filterClasses(
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
