import config_ from '../../../lib/config';
import { getBreakpoint } from '../../../lib/detect';
import fastdom from '../../../lib/fastdom-promise';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { addSlot } from './dfp/add-slot';
import { createSlots } from './dfp/create-slots';

// This is really a hacky workaround ⚠️
// TODO convert config.js to TypeScript
const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
};

// TODO Typescript Spacefinder
type RuleSpacing = {
	minAbove: number;
	minBelow: number;
};

type SpacefinderItem = {
	top: number;
	bottom: number;
	element: HTMLElement;
};

type SpacefinderRules = {
	bodySelector: string;
	body?: Node;
	slotSelector: string;
	// minimum from slot to top of page
	absoluteMinAbove?: number;
	// minimum from para to top of article
	minAbove: number;
	// minimum from (top of) para to bottom of article
	minBelow: number;
	// vertical px to clear the content meta element (byline etc) by. 0 to ignore
	clearContentMeta: number;
	// custom rules using selectors.
	selectors: Record<string, RuleSpacing>;
	// will run each slot through this fn to check if it must be counted in
	filter?: (x: SpacefinderItem) => boolean;
	// will remove slots before this one
	startAt?: HTMLElement;
	// will remove slots from this one on
	stopAt?: HTMLElement;
	// will reverse the order of slots (this is useful for lazy loaded content)
	fromBottom?: boolean;
};

const isDotcomRendering = config.get('isDotcomRendering', false) as boolean;
const bodySelector = isDotcomRendering
	? '.article-body-commercial-selector'
	: '.js-article__body';

const defaultRules: SpacefinderRules = {
	bodySelector,
	slotSelector: ' > p',
	minAbove: 500,
	minBelow: 400,
	clearContentMeta: 0,
	selectors: {
		' .element-rich-link': {
			minAbove: 100,
			minBelow: 400,
		},
		' .element-image': {
			minAbove: 440,
			minBelow: 440,
		},

		' .player': {
			minAbove: 50,
			minBelow: 50,
		},
		' > h1': {
			minAbove: 50,
			minBelow: 50,
		},
		' > h2': {
			minAbove: 50,
			minBelow: 50,
		},
		' > *:not(p):not(h2):not(blockquote)': {
			minAbove: 50,
			minBelow: 50,
		},
		' .ad-slot': {
			minAbove: 100,
			minBelow: 100,
		},
		' .element-pullquote': {
			minAbove: 400,
			minBelow: 400,
		},
	},
	fromBottom: true,
};

// desktop(980) and tablet(740)
const desktopRules: SpacefinderRules = {
	...defaultRules,
	selectors: {
		...defaultRules.selectors,
		' .element-rich-link': {
			minAbove: 400,
			minBelow: 400,
		},
		' .ad-slot': {
			minAbove: 400,
			minBelow: 400,
		},
		' .ad-slot--im': {
			minAbove: 400,
			minBelow: 400,
		},
	},
};

// mobile(320) and above
const mobileRules = {
	...defaultRules,
	selectors: {
		...defaultRules.selectors,
		' .element-rich-link': {
			minAbove: 400,
			minBelow: 400,
		},
		' .ad-slot': {
			minAbove: 400,
			minBelow: 400,
		},
		' .ad-slot--im': {
			minAbove: 400,
			minBelow: 400,
		},
	},
};

const insertSlot = (paras: HTMLElement[]): Promise<void> => {
	const slots = createSlots('carrot');
	const candidates = paras.slice(1);
	return fastdom
		.mutate(() => {
			slots.forEach((slot) => {
				if (candidates[0]?.parentNode) {
					candidates[0].parentNode.insertBefore(slot, candidates[0]);
				}
			});
		})
		.then(() => addSlot(slots[0], true));
};

const getRules = (): SpacefinderRules => {
	switch (getBreakpoint()) {
		case 'mobile':
		case 'mobileMedium':
		case 'mobileLandscape':
		case 'phablet':
			return mobileRules;
		case 'tablet':
		case 'desktop':
			return desktopRules;
		default:
			return defaultRules;
	}
};

export const initCarrot = (): Promise<void> => {
	if (commercialFeatures.carrotTrafficDriver) {
		return spaceFiller.fillSpace(getRules(), insertSlot, {
			waitForImages: true,
			waitForLinks: true,
			waitForInteractives: true,
		});
	}
	return Promise.resolve();
};
