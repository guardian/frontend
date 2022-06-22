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

const getSlotSizeMapping = (name: string): SizeMapping => {
	const slotName = name.includes('inline') ? 'inline' : name;
	if (isSlotName(slotName)) {
		return slotSizeMappings[slotName];
	}
	return {};
};

const mergeSizeMappings = (
	sizeMapping: SizeMapping,
	additionalSizeMapping: SizeMapping,
): SizeMapping => {
	const mergedSizeMapping = sizeMapping;
	(
		Object.entries(additionalSizeMapping) as Array<
			[keyof SizeMapping, AdSize[]]
		>
	).forEach(([breakpoint, breakPointSizes]) => {
		mergedSizeMapping[breakpoint] = mergedSizeMapping[breakpoint] ?? [];

		mergedSizeMapping[breakpoint]?.push(...breakPointSizes);
	});
	return mergedSizeMapping;
};

const isSizeMappingEmpty = (sizeMapping: SizeMapping): boolean => {
	return (
		Object.keys(sizeMapping).length === 0 ||
		Object.entries(sizeMapping).every(([, mapping]) => mapping.length === 0)
	);
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

	constructor(
		adSlotNode: HTMLElement,
		additionalSizeMapping: SizeMapping = {},
	) {
		const defaultSizeMappingForSlot = adSlotNode.dataset.name
			? getSlotSizeMapping(adSlotNode.dataset.name)
			: {};

		const sizeMapping = mergeSizeMappings(
			defaultSizeMappingForSlot,
			additionalSizeMapping,
		);

		if (isSizeMappingEmpty(sizeMapping)) {
			throw new Error(
				`Tried to render ad slot '${
					adSlotNode.dataset.name ?? ''
				}' without any size mappings`,
			);
		}

		const slotDefinition = defineSlot(adSlotNode, sizeMapping);

		this.id = adSlotNode.id;
		this.node = adSlotNode;
		this.sizes = sizeMapping;
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
	getSlotSizeMapping,
};
