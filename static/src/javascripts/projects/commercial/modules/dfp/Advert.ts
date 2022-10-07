import {
	concatSizeMappings,
	createAdSize,
	slotSizeMappings,
} from '@guardian/commercial-core';
import type { AdSize, SizeMapping, SlotName } from '@guardian/commercial-core';
import { breakpoints } from '../../../../lib/detect';
import fastdom from '../../../../lib/fastdom-promise';
import { breakpointNameToAttribute } from './breakpoint-name-to-attribute';
import { buildGoogletagSizeMapping, defineSlot } from './define-slot';

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
	attr.split('|').map((size) => createAdSize(...stringToTuple(size)));

/** Extract the ad sizes from the breakpoint data attributes of an ad slot
 *
 * @param advertNode The ad slot HTML element that contains the breakpoint attributes
 * @returns A mapping from the breakpoints supported by the slot to an array of ad sizes
 */
const getSlotSizeMappingsFromDataAttrs = (
	advertNode: HTMLElement,
): SizeMapping =>
	breakpoints.reduce<Record<string, AdSize[]>>((sizes, breakpoint) => {
		const data = advertNode.getAttribute(
			`data-${breakpointNameToAttribute(breakpoint.name)}`,
		);
		if (data) {
			sizes[breakpoint.name] = createSizeMapping(data);
		}
		return sizes;
	}, {});

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
	headerBiddingSizes: HeaderBiddingSize[] | null = null;
	size: AdSize | 'fluid' | null = null;
	slot: googletag.Slot;
	isEmpty: boolean | null = null;
	isRendered = false;
	shouldRefresh = false;
	whenSlotReady: Promise<void>;
	extraNodeClasses: string[] = [];
	hasPrebidSize = false;
	lineItemId: number | null = null;

	constructor(
		adSlotNode: HTMLElement,
		additionalSizeMapping: SizeMapping = {},
	) {
		this.id = adSlotNode.id;
		this.node = adSlotNode;
		this.sizes = this.generateSizeMapping(additionalSizeMapping);

		const slotDefinition = defineSlot(adSlotNode, this.sizes);

		this.slot = slotDefinition.slot;
		this.whenSlotReady = slotDefinition.slotReady;
	}

	/**
	 * Call this method once the ad has been rendered, it will set the
	 * `isRendered` flag to true, which is used to determine whether to load
	 * or refresh the ad
	 *
	 * @param isRendered was an advert rendered
	 */
	finishedRendering(isRendered: boolean): void {
		this.isRendered = isRendered;
	}

	/**
	 * Update the "extra" classes for this slot e.g. `ad-slot--outstream`, so that the main one's
	 * like `ad-slot` etc. are not affected
	 *
	 * @param newClasses An array of classes to set on the slot
	 **/
	async updateExtraSlotClasses(...newClasses: string[]): Promise<void> {
		const classesToRemove = this.extraNodeClasses.filter(
			(c) => !newClasses.includes(c),
		);

		await fastdom.mutate(() => {
			this.node.classList.remove(...classesToRemove);
			this.node.classList.add(...newClasses);
		});

		this.extraNodeClasses = newClasses;
	}

	/**
	 * Combine the size mapping from the mappings in commercial-core with
	 * any additional size mappings, if none are found check data-attributes, if still
	 * none are found throws an error
	 *
	 * @param additionalSizeMapping A mapping of breakpoints to ad sizes
	 * @returns A mapping of breakpoints to ad sizes
	 */
	generateSizeMapping(additionalSizeMapping: SizeMapping): SizeMapping {
		// Try to used size mappings if available
		const defaultSizeMappingForSlot = this.node.dataset.name
			? getSlotSizeMapping(this.node.dataset.name)
			: {};

		let sizeMapping = concatSizeMappings(
			defaultSizeMappingForSlot,
			additionalSizeMapping,
		);

		/** If the size mapping is empty, use the data attributes to create a size mapping,
		 * this is used on some interactives e.g. https://www.theguardian.com/education/ng-interactive/2021/sep/11/the-best-uk-universities-2022-rankings
		 **/
		if (isSizeMappingEmpty(sizeMapping)) {
			sizeMapping = getSlotSizeMappingsFromDataAttrs(this.node);

			// If the size mapping is still empty, throw an error as this should never happen
			if (isSizeMappingEmpty(sizeMapping)) {
				throw new Error(
					`Tried to render ad slot '${
						this.node.dataset.name ?? ''
					}' without any size mappings`,
				);
			}
		}

		return sizeMapping;
	}

	/**
	 * Update the size mapping for this slot, you will need to call
	 * refreshAdvert to update the ad immediately
	 *
	 * @param additionalSizeMapping A mapping of breakpoints to ad sizes
	 **/
	updateSizeMapping(additionalSizeMapping: SizeMapping): void {
		const sizeMapping = this.generateSizeMapping(additionalSizeMapping);

		this.sizes = sizeMapping;

		const googletagSizeMapping = buildGoogletagSizeMapping(sizeMapping);
		if (googletagSizeMapping) {
			this.slot.defineSizeMapping(googletagSizeMapping);
		}
	}
}

export { Advert };

export const _ = {
	getSlotSizeMapping,
};
