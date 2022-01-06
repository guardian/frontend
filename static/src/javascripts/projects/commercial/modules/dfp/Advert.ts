import { breakpoints } from '../../../../lib/detect';
import { breakpointNameToAttribute } from './breakpoint-name-to-attribute';
import { defineSlot } from './define-slot';

type Resolver = (x: boolean) => void;

type Timings = {
	createTime: number | null;
	startLoading: number | null;
	stopLoading: number | null;
	startRendering: number | null;
	stopRendering: number | null;
	loadingMethod: number | null;
	lazyWaitComplete: number | null;
};

const stringToTuple = (size: string): AdSizeTuple => {
	const dimensions = size.split(',', 2).map(Number);

	// Return an outOfPage tuple if the string is not `{number},{number}`
	if (dimensions.length !== 2 || dimensions.some((n) => isNaN(n)))
		return [0, 0]; // adSizes.outOfPage

	return [dimensions[0], dimensions[1]];
};

/** A breakpoint can have various sizes assigned to it. You can assign either on
 * set of sizes or multiple.
 *
 * One size       - `data-mobile="300,50"`
 * Multiple sizes - `data-mobile="300,50|320,50"`
 */
const createSizeMapping = (attr: string): AdSize[] =>
	attr
		.split('|')
		.map((size) => (size === 'fluid' ? 'fluid' : stringToTuple(size)));

/** Extract the ad sizes from the breakpoint data attributes of an ad slot
 *
 * @param advertNode The ad slot HTML element that contains the breakpoint attributes
 * @returns A mapping from the breakpoints supported by the slot to an array of ad sizes
 */
const getAdBreakpointSizes = (advertNode: HTMLElement): AdSizes =>
	breakpoints.reduce<Record<string, AdSize[]>>((sizes, breakpoint) => {
		const data = advertNode.getAttribute(
			`data-${breakpointNameToAttribute(breakpoint.name)}`,
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
	size: AdSize | null = null;
	slot: googletag.Slot;
	isEmpty: boolean | null = null;
	isLoading = false;
	isRendering = false;
	isLoaded = false;
	isRendered = false;
	shouldRefresh = false;
	whenLoaded: Promise<boolean>;
	whenLoadedResolver: Resolver | null = null;
	whenRendered: Promise<boolean>;
	whenRenderedResolver: Resolver | null = null;
	whenSlotReady: Promise<void>;
	extraNodeClasses: string[] = [];
	timings: Timings = {
		createTime: null,
		startLoading: null,
		stopLoading: null,
		startRendering: null,
		stopRendering: null,
		loadingMethod: null,
		lazyWaitComplete: null,
	};
	hasPrebidSize = false;
	lineItemId: number | null = null;

	constructor(adSlotNode: HTMLElement) {
		const sizes = getAdBreakpointSizes(adSlotNode);
		const slotDefinition = defineSlot(adSlotNode, sizes);

		this.id = adSlotNode.id;
		this.node = adSlotNode;
		this.sizes = sizes;
		this.slot = slotDefinition.slot;

		this.whenSlotReady = slotDefinition.slotReady;

		this.whenLoaded = new Promise((resolve: Resolver) => {
			this.whenLoadedResolver = resolve;
		}).then((isLoaded: boolean): boolean => {
			this.isLoaded = isLoaded;
			return isLoaded;
		});

		this.whenRendered = new Promise((resolve: Resolver) => {
			this.whenRenderedResolver = resolve;
		}).then((isRendered) => {
			this.isRendered = isRendered;
			return isRendered;
		});
	}

	static filterClasses = (
		oldClasses: string[],
		newClasses: string[],
	): string[] =>
		oldClasses.filter((oldClass) => !newClasses.includes(oldClass));

	startLoading(): void {
		this.isLoading = true;
		this.timings.startLoading = window.performance.now();
	}

	stopLoading(isLoaded: boolean): void {
		this.isLoading = false;
		if (this.whenLoadedResolver) {
			this.whenLoadedResolver(isLoaded);
		}
		this.timings.stopLoading = window.performance.now();
	}

	startRendering(): void {
		this.isRendering = true;
		this.timings.startRendering = window.performance.now();
	}

	stopRendering(isRendered: boolean): void {
		this.isRendering = false;
		if (this.whenRenderedResolver) {
			this.whenRenderedResolver(isRendered);
		}
	}

	updateExtraSlotClasses(...newClasses: string[]): void {
		const classesToRemove = Advert.filterClasses(
			this.extraNodeClasses,
			newClasses,
		);
		// IE11 does not support multiple arguments to classList.add/remove so do these one-by-ones
		classesToRemove.forEach((cls) => this.node.classList.remove(cls));
		newClasses.forEach((cls) => this.node.classList.add(cls));
		this.extraNodeClasses = newClasses;
	}
}

export { Advert };

export const _ = {
	filterClasses: Advert.filterClasses,
	createSizeMapping,
	getAdBreakpointSizes,
};
