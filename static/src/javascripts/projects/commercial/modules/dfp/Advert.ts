import { slotSizeMappings } from '@guardian/commercial-core';
import type { AdSize, SizeMapping, SlotName } from '@guardian/commercial-core';
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

const isSlotName = (slotName: string): slotName is SlotName => {
	return slotName in slotSizeMappings;
};

const getAdSizeMapping = (name: string): SizeMapping | undefined => {
	const slotName = /inline\d+/.test(name) ? 'inline' : name;
	if (isSlotName(slotName)) {
		return slotSizeMappings[slotName];
	}
};

class Advert {
	id: string;
	node: HTMLElement;
	sizes: SizeMapping;
	size: AdSize | 'fluid' | null = null;
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

	constructor(adSlotNode: HTMLElement, additionalSizes?: SizeMapping) {
		const sizes = getAdSizeMapping(adSlotNode.dataset.name ?? '') ?? {};

		if (additionalSizes) {
			(
				Object.entries(additionalSizes) as Array<
					[keyof SizeMapping, AdSize[]]
				>
			).forEach(([breakpoint, breakPointSizes]) => {
				sizes[breakpoint] = sizes[breakpoint] ?? [];

				sizes[breakpoint]?.push(...breakPointSizes);
			});
		}

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
	getAdSizeMapping,
};
