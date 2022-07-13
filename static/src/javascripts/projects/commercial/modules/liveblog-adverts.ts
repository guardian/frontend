import { createAdSlot } from '@guardian/commercial-core';
import { getUrlVars } from 'lib/url';
import { getBreakpoint } from '../../../lib/detect';
import fastdom from '../../../lib/fastdom-promise';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import type {
	SpacefinderItem,
	SpacefinderRules,
	SpacefinderWriter,
} from '../../common/modules/spacefinder';
import { defaultSpacefinderOptions } from '../../common/modules/spacefinder';
import { addSlot } from './dfp/add-slot';

// We do not want ads to load too high up on the screen. We use this
// multiplier of screen height to decide where we can load ads from.
const MIN_GAP_FROM_PAGE_TOP_MULTIPLIER = 1.5;

// We do not want ads to load too close together. We use this multiplier
// of screen height to ensure the minimum gap in which ads can load.
const MIN_SPACE_BETWEEN_ADS_MULTIPLIER = 2;

// maximum number of ads to display
const MAX_ADS = 8;

let AD_COUNTER = 0;
let WINDOWHEIGHT: number;
let firstSlot: HTMLElement | undefined;

const sfdebug = getUrlVars().sfdebug;

const startListening = () => {
	document.addEventListener('liveblog:blocks-updated', onUpdate);
};

const stopListening = () => {
	document.removeEventListener('liveblog:blocks-updated', onUpdate);
};

const getWindowHeight = (doc = document) => {
	if (doc.documentElement.clientHeight) {
		return doc.documentElement.clientHeight;
	}
	return 0; // #? zero, or throw an error?
};

const getSpaceFillerRules = (
	windowHeight: number,
	shouldUpdate = false,
): SpacefinderRules => {
	let prevSlot: SpacefinderItem | undefined;

	const isEnoughSpaceBetweenSlots = (
		prevSlot: SpacefinderItem,
		slot: SpacefinderItem,
	) =>
		Math.abs(slot.top - prevSlot.top) >
		windowHeight * MIN_SPACE_BETWEEN_ADS_MULTIPLIER;

	const filterSlot = (slot: SpacefinderItem) => {
		if (!prevSlot) {
			prevSlot = slot;
			return !shouldUpdate;
		} else if (isEnoughSpaceBetweenSlots(prevSlot, slot)) {
			prevSlot = slot;
			return true;
		}
		return false;
	};

	return {
		bodySelector: '.js-liveblog-body',
		slotSelector: ' > .block',
		fromBottom: shouldUpdate,
		startAt: shouldUpdate ? firstSlot : undefined,
		absoluteMinAbove: shouldUpdate
			? 0
			: WINDOWHEIGHT * MIN_GAP_FROM_PAGE_TOP_MULTIPLIER,
		minAbove: 0,
		minBelow: 0,
		clearContentMeta: 0,
		selectors: {},
		filter: filterSlot,
	};
};

const getSlotName = (isMobile: boolean, slotCounter: number): string => {
	if (isMobile && slotCounter === 0) {
		return 'top-above-nav';
	} else if (isMobile) {
		return `inline${slotCounter}`;
	}
	return `inline${slotCounter + 1}`;
};

const insertAds: SpacefinderWriter = async (paras) => {
	const isMobile = getBreakpoint() === 'mobile';
	const fastdomPromises = [];
	for (let i = 0; i < paras.length && AD_COUNTER < MAX_ADS; i += 1) {
		const para = paras[i];
		if (para.parentNode) {
			const adSlot = createAdSlot('inline', {
				name: getSlotName(isMobile, AD_COUNTER),
				classes: 'liveblog-inline',
			});
			// insert the ad slot container into the DOM
			const result = fastdom.mutate(() => {
				para.parentNode?.insertBefore(adSlot, para.nextSibling);
			});
			fastdomPromises.push(result);
			// load and display the advert via GAM
			addSlot(adSlot, false);
			AD_COUNTER += 1;
		}
	}
	await Promise.all(fastdomPromises);
};

const fill = (rules: SpacefinderRules) => {
	const options = { ...defaultSpacefinderOptions, debug: sfdebug === '1' };

	return spaceFiller.fillSpace(rules, insertAds, options).then(() => {
		if (AD_COUNTER < MAX_ADS) {
			const el = document.querySelector(
				`${rules.bodySelector} > .ad-slot`,
			);
			if (el && el.previousSibling instanceof HTMLElement) {
				firstSlot = el.previousSibling;
			} else {
				firstSlot = undefined;
			}
			startListening();
		} else {
			firstSlot = undefined;
		}
	});
};

const onUpdate = () => {
	stopListening();
	const rules = getSpaceFillerRules(WINDOWHEIGHT, true);
	void fill(rules);
};

/**
 * Initialise liveblog ad slots
 */
export const init = (): Promise<void> => {
	if (!commercialFeatures.liveblogAdverts) {
		return Promise.resolve();
	}

	return fastdom
		.measure(() => {
			WINDOWHEIGHT = getWindowHeight();
			return WINDOWHEIGHT;
		})
		.then(getSpaceFillerRules)
		.then(fill);
};

export const _ = { getSlotName };
