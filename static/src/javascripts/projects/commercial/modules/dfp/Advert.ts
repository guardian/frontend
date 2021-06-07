import { breakpoints } from '../../../../lib/detect';
import { getCurrentTime } from '../../../../lib/user-timing';
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

// Temporary definition until './define-slot' is converted to TypeScript
type SlotDefinition = {
	slot: Record<string, any>;
	slotReady: Promise<void>;
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
		.map((size) =>
			size === 'fluid' ? 'fluid' : size.split(',').map(Number),
		);

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
	slot: Record<string, unknown>;
	isEmpty: boolean | null = null;
	isLoading = false;
	isRendering = false;
	isLoaded = false;
	isRendered = false;
	shouldRefresh = false;
	maxViewPercentage = 0;
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

	constructor(adSlotNode: HTMLElement) {
		const sizes = getAdBreakpointSizes(adSlotNode);
		const slotDefinition = defineSlot(adSlotNode, sizes) as SlotDefinition;

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
		this.timings.startLoading = getCurrentTime();
	}

	stopLoading(isLoaded: boolean): void {
		this.isLoading = false;
		if (this.whenLoadedResolver) {
			this.whenLoadedResolver(isLoaded);
		}
		this.timings.stopLoading = getCurrentTime();
	}

	startRendering(): void {
		this.isRendering = true;
		this.timings.startRendering = getCurrentTime();
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
};
