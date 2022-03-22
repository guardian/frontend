import fastdom from '../../../lib/fastdom-promise';
import { getBreakpoint } from '../../../lib/detect';
import { mediator } from '../../../lib/mediator';
import { addSlot } from './dfp/add-slot';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { createAdSlot } from './dfp/create-slot';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { spacefinderOkrMegaTest } from 'common/modules/experiments/tests/spacefinder-okr-mega-test';

const OFFSET = 1.5; // ratio of the screen height from which ads are loaded
const MAX_ADS = 8; // maximum number of ads to display

let AD_COUNTER = 0;
let WINDOWHEIGHT;
let firstSlot;

const startListening = () => {
	// frontend - remove when migration to DCR is complete
	mediator.on('modules:autoupdate:updates', onUpdate);
	// DCR
	document.addEventListener('liveblog:blocks-updated', onUpdate);
};

const stopListening = () => {
	// frontend - remove when migration to DCR is complete
	mediator.off('modules:autoupdate:updates', onUpdate);
	// DCR
	document.removeEventListener('liveblog:blocks-updated', onUpdate);
};

const getWindowHeight = (doc = document) => {
	if (doc.documentElement && doc.documentElement.clientHeight) {
		return doc.documentElement.clientHeight;
	}
	return 0; // #? zero, or throw an error?
};

const getSpaceFillerRules = (windowHeight, update) => {
	let prevSlot;
	const shouldUpdate = !!update;

	// Only use a slot if it is double the window height from the previous slot.
	const filterSlot = (slot) => {
		if (!prevSlot) {
			prevSlot = slot;
			return !shouldUpdate;
		} else if (Math.abs(slot.top - prevSlot.top) > windowHeight * 2) {
			prevSlot = slot;
			return true;
		}
		return false;
	};

	return {
		bodySelector: '.js-liveblog-body',
		slotSelector: ' > .block',
		fromBottom: shouldUpdate,
		startAt: shouldUpdate ? firstSlot : null,
		absoluteMinAbove: shouldUpdate ? 0 : WINDOWHEIGHT * OFFSET,
		minAbove: 0,
		minBelow: 0,
		clearContentMeta: 0,
		selectors: {},
		filter: filterSlot,
	};
};

const getSlotName = (isMobile, slotCounter) => {
	if (isMobile && slotCounter === 0) {
		return 'top-above-nav';
	} else if (isMobile) {
		return `inline${slotCounter}`;
	}
	return `inline${slotCounter + 1}`;
};

const insertAds = (paras) => {
	const isMobile = getBreakpoint() === 'mobile';
	let fastdomPromises = [];
	for (let i = 0; i < paras.length && AD_COUNTER < MAX_ADS; i += 1) {
		const para = paras[i];
		if (para && para.parentNode) {
			const adSlot = createAdSlot('inline', {
				name: getSlotName(isMobile, AD_COUNTER),
				classes: 'liveblog-inline',
			});
			// insert the ad slot container into the DOM
			const result = fastdom.mutate(() => {
				para.parentNode.insertBefore(adSlot, para.nextSibling);
			});
			fastdomPromises.push(result);
			// load and display the advert via GAM
			addSlot(adSlot, false);
			AD_COUNTER += 1;
		}
	}
	return Promise.all(fastdomPromises);
};

const fill = (rules) =>
	spaceFiller.fillSpace(rules, insertAds).then((result) => {
		const disableAdditionalBlocksFix = isInVariantSynchronous(
			spacefinderOkrMegaTest,
			'control',
		);
		if (disableAdditionalBlocksFix) {
			// Before the refactor of fillSpace in https://github.com/guardian/frontend/pull/24599,
			// since insertAds returned void, result was always undefined and the code path below was dead.
			// Measure the uplift in impressions from fixing the bug by keeping the feature broken for the
			// variant group of the mega test.
			result = undefined;
		}
		if (result && AD_COUNTER < MAX_ADS) {
			const el = document.querySelector(
				`${rules.bodySelector} > .ad-slot`,
			);
			if (el && el.previousSibling instanceof HTMLElement) {
				firstSlot = el.previousSibling;
			} else {
				firstSlot = null;
			}
			startListening();
		} else {
			firstSlot = null;
		}
	});

const onUpdate = () => {
	stopListening();
	Promise.resolve(getSpaceFillerRules(WINDOWHEIGHT, true)).then(fill);
};

/**
 * Initialise liveblog ad slots
 */
export const init = () => {
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
