import { createAdSlot } from '@guardian/commercial-core';
import { getCurrentTweakpoint } from 'lib/detect-breakpoint';
import { getUrlVars } from 'lib/url';
import fastdom from '../../../lib/fastdom-promise';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import type {
	SpacefinderRules,
	SpacefinderWriter,
} from '../../common/modules/spacefinder';
import { addSlot } from './dfp/add-slot';

const sfdebug = getUrlVars().sfdebug;

const bodySelector = '.article-body-commercial-selector';

const wideRules: SpacefinderRules = {
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
		' > *:not(p):not(h2):not(blockquote):not(#sign-in-gate):not(.sfdebug)':
			{
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

// anything below leftCol (1140) : desktop, tablet, ..., mobile
const desktopRules: SpacefinderRules = {
	...wideRules,
	selectors: {
		...wideRules.selectors,
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

const insertSlot: SpacefinderWriter = (paras) => {
	const slot = createAdSlot('carrot');
	const candidates = paras.slice(1);
	return fastdom
		.mutate(() => {
			if (candidates[0]?.parentNode) {
				candidates[0].parentNode.insertBefore(slot, candidates[0]);
			}
		})
		.then(() => addSlot(slot, true));
};

const getRules = (): SpacefinderRules => {
	switch (getCurrentTweakpoint()) {
		case 'leftCol':
		case 'wide':
			return wideRules;
		default:
			return desktopRules;
	}
};

export const initCarrot = (): Promise<boolean> => {
	const enableDebug = sfdebug === 'carrot';

	if (commercialFeatures.carrotTrafficDriver) {
		return spaceFiller.fillSpace(getRules(), insertSlot, {
			waitForImages: true,
			waitForInteractives: true,
			debug: enableDebug,
		});
	}
	return Promise.resolve(false);
};
