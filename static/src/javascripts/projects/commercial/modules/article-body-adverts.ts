import type { AdSize } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import { getBreakpoint, getViewport } from 'lib/detect-viewport';
import config from '../../../lib/config';
import { mediator } from '../../../lib/mediator';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { initCarrot } from './carrot-traffic-driver';
import { addSlot } from './dfp/add-slot';
import { createAdSlot } from './dfp/create-slot';
import { trackAdRender } from './dfp/track-ad-render';

const isPaidContent = config.get<boolean>('page.isPaidContent', false);

const adSlotClassSelectorSizes = {
	minAbove: 500,
	minBelow: 500,
};

const insertAdAtPara = (
	para: Node,
	name: string,
	type: string,
	classes?: string,
	sizes?: Record<string, AdSize[]>,
): void => {
	const ad = createAdSlot(type, {
		name,
		classes,
		sizes,
	});
	if (para.parentNode) {
		para.parentNode.insertBefore(ad, para);
	}
	const shouldForceDisplay = ['im', 'carrot'].includes(name);
	addSlot(ad, shouldForceDisplay);
};

let previousAllowedCandidate: SpacefinderItem;

// this facilitates a second filtering, now taking into account the candidates' position/size relative to the other candidates
const filterNearbyCandidates =
	(maximumAdHeight: number) => (candidate: SpacefinderItem) => {
		if (
			!previousAllowedCandidate ||
			Math.abs(candidate.top - previousAllowedCandidate.top) -
				maximumAdHeight >=
				adSlotClassSelectorSizes.minBelow
		) {
			previousAllowedCandidate = candidate;
			return true;
		}
		return false;
	};

const isDotcomRendering = config.get('isDotcomRendering', false) as boolean;
const articleBodySelector = isDotcomRendering
	? '.article-body-commercial-selector'
	: '.js-article__body';

const addDesktopInlineAds = (isInline1: boolean) => {
	const isImmersive = config.get('page.isImmersive');
	const defaultRules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: isImmersive ? 700 : 300,
		minBelow: isDotcomRendering ? 300 : 700,
		selectors: {
			' > h2': {
				minAbove: 5,
				minBelow: 190,
			},
			' .ad-slot': adSlotClassSelectorSizes,
			' > :not(p):not(h2):not(.ad-slot)': {
				minAbove: 35,
				minBelow: 400,
			},
			' figure.element--immersive': {
				minAbove: 0,
				minBelow: 600,
			},
			' figure.element--supporting': {
				minAbove: 500,
				minBelow: 0,
			},
		},
		filter: filterNearbyCandidates(adSizes.mpu.height),
	};

	// For any other inline
	const relaxedRules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: isPaidContent ? 1600 : 1000,
		minBelow: isDotcomRendering ? 300 : 800,
		selectors: {
			' .ad-slot': adSlotClassSelectorSizes,
			' figure.element--immersive': {
				minAbove: 0,
				minBelow: 600,
			},
			' [data-spacefinder-ignore="numbered-list-title"]': {
				minAbove: 25,
				minBelow: 0,
			},
		},
		filter: filterNearbyCandidates(adSizes.halfPage.height),
	};

	const rules = isInline1 ? defaultRules : relaxedRules;

	const insertAds: SpacefinderWriter = (paras) => {
		paras.slice(0, isInline1 ? 1 : paras.length).map((para, i) => {
			const inlineId = i + (isInline1 ? 1 : 2);
			insertAdAtPara(
				para,
				`inline${inlineId}`,
				'inline',
				`inline${isInline1 ? '' : ' offset-right'}`,
				isInline1
					? undefined
					: { desktop: [adSizes.halfPage, adSizes.skyscraper] },
			);
		});
	};

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
	});
};

const addMobileInlineAds = () => {
	const rules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: 200,
		minBelow: 200,
		selectors: {
			' > h2': {
				minAbove: 100,
				minBelow: 250,
			},
			' .ad-slot': adSlotClassSelectorSizes,
			' > :not(p):not(h2):not(.ad-slot)': {
				minAbove: 35,
				minBelow: 200,
			},
		},
		// TODO this looks like it was mistakenly put in the selectors object.
		// What is the impact of correcting the typo??
		fromBottom: true,
		filter: filterNearbyCandidates(adSizes.mpu.height),
	};

	const insertAds: SpacefinderWriter = (paras) => {
		paras.map((para, i) =>
			insertAdAtPara(
				para,
				i === 0 ? 'top-above-nav' : `inline${i}`,
				i === 0 ? 'top-above-nav' : 'inline',
				'inline',
			),
		);
	};

	// This just returns whatever is passed in the second argument
	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
	});
};

const addInlineAds = () => {
	const isMobile = getBreakpoint(getViewport().width) === 'mobile';

	if (isMobile) {
		return addMobileInlineAds();
	}
	if (isPaidContent) {
		return addDesktopInlineAds(false);
	}
	return addDesktopInlineAds(true).then(() => addDesktopInlineAds(false));
};

const attemptToAddInlineMerchAd = () => {
	const breakpoint = getBreakpoint(getViewport().width);
	const isMobileOrTablet = breakpoint === 'mobile' || breakpoint === 'tablet';

	const rules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: 300,
		minBelow: 0,
		selectors: {
			' > .merch': {
				minAbove: 0,
				minBelow: 0,
			},
			' > header': {
				minAbove: isMobileOrTablet ? 300 : 700,
				minBelow: 0,
			},
			' > h2': {
				minAbove: 100,
				minBelow: 250,
			},
			' .ad-slot': adSlotClassSelectorSizes,
			' > :not(p):not(h2):not(.ad-slot)': {
				minAbove: 200,
				minBelow: 400,
			},
		},
	};

	const insertAds: SpacefinderWriter = (paras) =>
		insertAdAtPara(paras[0], 'im', 'im');

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
	});
};

const doInit = async (): Promise<boolean> => {
	if (!commercialFeatures.articleBodyAdverts) {
		return Promise.resolve(false);
	}

	const im = config.get('page.hasInlineMerchandise')
		? attemptToAddInlineMerchAd()
		: Promise.resolve(false);
	const inlineMerchAdded = await im;
	if (inlineMerchAdded) await trackAdRender('dfp-ad--im');
	await addInlineAds();
	await initCarrot();

	return im;
};

/**
 * Initialise article body ad slots
 */
export const init = (): Promise<boolean | void> => {
	// Also init when the main article is redisplayed
	// For instance by the signin gate.
	mediator.on('page:article:redisplayed', doInit);
	// DCR doesn't have mediator, so listen for CustomEvent
	document.addEventListener('dcr:page:article:redisplayed', doInit);
	return doInit();
};
