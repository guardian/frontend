import fastdom from '../../../lib/fastdom-promise';
import { getBreakpoint } from '../../../lib/detect';
import { mediator } from '../../../lib/mediator';
import { addSlot } from './dfp/add-slot';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { createAdSlot } from './dfp/create-slot';
import { spaceFiller } from '../../common/modules/article/space-filler';

const OFFSET = 1.5; // ratio of the screen height from which ads are loaded
const MAX_ADS = 8; // maximum number of ads to display

let AD_COUNTER = 0;
let WINDOWHEIGHT;
let firstSlot;

const startListening = () => {
	// eslint-disable-next-line no-use-before-define
	mediator.on('modules:autoupdate:updates', onUpdate);
};

const stopListening = () => {
	// eslint-disable-next-line no-use-before-define
	mediator.off('modules:autoupdate:updates', onUpdate);
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

	for (let i = 0; i < paras.length && AD_COUNTER < MAX_ADS; i += 1) {
		const para = paras[i];
		if (para && para.parentNode) {
			const adSlot = createAdSlot('inline', {
				name: getSlotName(isMobile, AD_COUNTER),
				classes: 'liveblog-inline',
			});
			// insert the ad slot container into the DOM
			para.parentNode.insertBefore(adSlot, para.nextSibling);
			// load and display the advert via GAM
			addSlot(adSlot, false);
			AD_COUNTER += 1;
		}
	}
};

const fill = (rules) =>
	spaceFiller.fillSpace(rules, insertAds).then((result) => {
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
