import { createAdSlot } from '@guardian/commercial-core';
import { getUrlVars } from 'lib/url';
import fastdom from '../../../../../lib/fastdom-promise';
import { spaceFiller } from '../../../../common/modules/article/space-filler';
import { commercialFeatures } from '../../../../common/modules/commercial/commercial-features';
import type {
	SpacefinderItem,
	SpacefinderOptions,
	SpacefinderRules,
	SpacefinderWriter,
} from '../../../../common/modules/spacefinder';
import { defineSlot } from '../define-slot';

/**
 * Maximum number of inline ads to display on the page.
 */
const MAX_ADS = 8;

/**
 * Multiplier of screen height that determines the distance from
 * the top of the page that we can start placing ads.
 */
const PAGE_TOP_MULTIPLIER = 1.5;

/**
 * Multiplier of screen height that sets the minimum distance that two ads can be placed.
 */
const AD_SPACE_MULTIPLIER = 2;

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
	) => Math.abs(slot.top - prevSlot.top) > windowHeight * AD_SPACE_MULTIPLIER;

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
		absoluteMinAbove: shouldUpdate ? 0 : WINDOWHEIGHT * PAGE_TOP_MULTIPLIER,
		minAbove: 0,
		minBelow: 0,
		clearContentMeta: 0,
		selectors: {},
		filter: filterSlot,
	};
};

const insertAdAtPara = (para: Node): Promise<void> => {
	const container: HTMLElement = document.createElement('div');
	container.className = `ad-slot-container`;

	const adSlot = createAdSlot('inline', {
		name: `inline${AD_COUNTER + 1}`,
		classes: 'liveblog-inline',
	});

	container.appendChild(adSlot);

	return fastdom
		.mutate(() => {
			if (para.parentNode) {
				/* ads are inserted after the block on liveblogs */
				para.parentNode.insertBefore(container, para.nextSibling);
			}
		})
		.then(() => {
			defineSlot(adSlot, 'inline');
		});
};

const insertAds: SpacefinderWriter = async (paras) => {
	const fastdomPromises = [];
	for (let i = 0; i < paras.length && AD_COUNTER < MAX_ADS; i += 1) {
		const para = paras[i];
		if (para.parentNode) {
			const result = insertAdAtPara(para);
			fastdomPromises.push(result);
			AD_COUNTER += 1;
		}
	}
	await Promise.all(fastdomPromises);
};

const fill = (rules: SpacefinderRules) => {
	const options: SpacefinderOptions = { debug: sfdebug === '1' };

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
const initLiveblogInline = (): Promise<void> => {
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

export { initLiveblogInline };
