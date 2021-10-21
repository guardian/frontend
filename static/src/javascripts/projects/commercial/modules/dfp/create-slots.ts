import { adSizes } from '@guardian/commercial-core';
import type { SizeMappings } from './size-mapping';
import { mergeSizeMappings, sizeMappingsToString } from './size-mapping';

type AdSlotDefinition = {
	sizeMappings: SizeMappings;
	label?: boolean;
	refresh?: boolean;
	name?: string;
};

type AdSlotDefinitions = Record<string, AdSlotDefinition>;

type CreateSlotOptions = {
	classes?: string;
	name?: string;
	sizes?: SizeMappings;
};

const inlineDefinition: AdSlotDefinition = {
	sizeMappings: {
		mobile: [
			adSizes.outOfPage,
			adSizes.empty,
			adSizes.outstreamMobile,
			adSizes.mpu,
			adSizes.googleCard,
			adSizes.fluid,
		],
		phablet: [
			adSizes.outOfPage,
			adSizes.empty,
			adSizes.outstreamMobile,
			adSizes.mpu,
			adSizes.googleCard,
			adSizes.outstreamDesktop,
			adSizes.outstreamGoogleDesktop,
			adSizes.fluid,
		],
		desktop: [
			adSizes.outOfPage,
			adSizes.empty,
			adSizes.mpu,
			adSizes.googleCard,
			adSizes.video,
			adSizes.outstreamDesktop,
			adSizes.outstreamGoogleDesktop,
			adSizes.fluid,
		],
	},
};

/*

    mark: 432b3a46-90c1-4573-90d3-2400b51af8d0

    The ad sizes which are hardcoded here are also hardcoded in the source code of
    dotcom-rendering.

    If/when this file is modified, please make sure that updates, if any, are reported to DCR.

 */

const adSlotDefinitions: AdSlotDefinitions = {
	im: {
		label: false,
		refresh: false,
		sizeMappings: {
			mobile: [
				adSizes.outOfPage,
				adSizes.empty,
				adSizes.inlineMerchandising,
				adSizes.fluid,
			],
		},
	},
	'high-merch': {
		label: false,
		refresh: false,
		name: 'merchandising-high',
		sizeMappings: {
			mobile: [
				adSizes.outOfPage,
				adSizes.empty,
				adSizes.merchandisingHigh,
				adSizes.fluid,
			],
		},
	},
	'high-merch-lucky': {
		label: false,
		refresh: false,
		name: 'merchandising-high-lucky',
		sizeMappings: {
			mobile: [adSizes.outOfPage, adSizes.empty, adSizes.fluid],
		},
	},
	'high-merch-paid': {
		label: false,
		refresh: false,
		name: 'merchandising-high',
		sizeMappings: {
			mobile: [
				adSizes.outOfPage,
				adSizes.empty,
				adSizes.merchandisingHighAdFeature,
				adSizes.fluid,
			],
		},
	},
	inline: inlineDefinition,
	mostpop: inlineDefinition,
	comments: inlineDefinition,
	'top-above-nav': {
		sizeMappings: {
			mobile: [
				adSizes.outOfPage,
				adSizes.empty,
				adSizes.fabric,
				adSizes.outstreamMobile,
				adSizes.mpu,
				adSizes.fluid,
			],
		},
	},
	carrot: {
		label: false,
		refresh: false,
		name: 'carrot',
		sizeMappings: {
			mobile: [adSizes.fluid],
		},
	},
	epic: {
		label: false,
		refresh: false,
		name: 'epic',
		sizeMappings: {
			mobile: [adSizes.fluid],
		},
	},
	'mobile-sticky': {
		label: true,
		refresh: true,
		name: 'mobile-sticky',
		sizeMappings: {
			mobile: [adSizes.mobilesticky],
		},
	},
};

/*
  Returns an array of adSlot HTMLElement(s) with always at least one HTMLDivElement
  which is the main DFP slot.

  Insert those elements as siblings at the place
  you want adverts to appear.

  Note that for the DFP slot to be filled by GTP, you'll have to
  use addSlot from add-slot.js
*/

const createAdSlotElements = (
	name: string,
	attrs: Record<string, string>,
	classes: string[],
): HTMLElement[] => {
	const adSlots = [];

	const id = `dfp-ad--${name}`;

	// 3562dc07-78e9-4507-b922-78b979d4c5cb
	if (window.guardian.config.isDotcomRendering && name === 'top-above-nav') {
		// This is to prevent a problem that appeared with DCR.
		// We are simply making sure that if we are about to
		// introduce dfp-ad--top-above-nav then there isn't already one.
		const node = document.getElementById(id);
		if (node?.parentNode) {
			const pnode = node.parentNode;
			console.log(`warning: cleaning up dom node id: dfp-ad--${name}`);
			pnode.removeChild(node);
		}
	}

	// The 'main' adSlot
	const adSlot = document.createElement('div');
	adSlot.id = id;
	adSlot.className = `js-ad-slot ad-slot ${classes.join(' ')}`;
	adSlot.setAttribute('data-link-name', `ad slot ${name}`);
	adSlot.setAttribute('data-name', name);
	adSlot.setAttribute('aria-hidden', 'true');
	Object.keys(attrs).forEach((attr) => {
		adSlot.setAttribute(attr, attrs[attr]);
	});

	adSlots.push(adSlot);

	return adSlots;
};

export const createSlots = (
	type: string,
	options: CreateSlotOptions = {},
): HTMLElement[] => {
	const attributes: Record<string, string> = {};
	const definition: AdSlotDefinition = adSlotDefinitions[type];
	const slotName: string = options.name ?? definition.name ?? type;
	const classes: string[] =
		options.classes?.split(' ').map((cn) => `ad-slot--${cn}`) ?? [];

	const sizes = mergeSizeMappings(definition.sizeMappings, options.sizes);

	const sizeStrings = sizeMappingsToString(sizes);

	Object.assign(attributes, sizeStrings);

	if (definition.label === false) {
		attributes.label = 'false';
	}

	if (definition.refresh === false) {
		attributes.refresh = 'false';
	}

	classes.push(`ad-slot--${slotName}`);

	return createAdSlotElements(
		slotName,
		Object.keys(attributes).reduce(
			(result, key) =>
				Object.assign({}, result, { [`data-${key}`]: attributes[key] }),
			{},
		),
		classes,
	);
};
