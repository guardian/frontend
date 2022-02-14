import config from '../../../lib/config';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { adSizes } from '@guardian/commercial-core';
import { addSlot } from './dfp/add-slot';
import { trackAdRender } from './dfp/track-ad-render';
import { createAdSlot } from './dfp/create-slot';

import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { initCarrot } from './carrot-traffic-driver';
import { getBreakpoint, getTweakpoint, getViewport } from 'lib/detect-viewport';
import { getUrlVars } from 'lib/url';

import { filterNearbyCandidatesBroken } from './filter-nearby-candidates-broken.ts';
import { filterNearbyCandidatesFixed } from './filter-nearby-candidates-fixed.ts';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { spacefinderOkr1FilterNearby } from 'common/modules/experiments/tests/spacefinder-okr-1-filter-nearby';

const sfdebug = getUrlVars().sfdebug;

const isPaidContent = config.get('page.isPaidContent', false);

const adSlotClassSelectorSizes = {
	minAbove: 500,
	minBelow: 500,
};

const insertAdAtPara = (para, name, type, classes, sizes) => {
	const ad = createAdSlot(type, {
		name,
		classes,
		sizes,
	});

	return fastdom
		.mutate(() => {
			if (para.parentNode) {
				para.parentNode.insertBefore(ad, para);
			}
		})
		.then(() => {
			const shouldForceDisplay = ['im', 'carrot'].includes(name);
			addSlot(ad, shouldForceDisplay);
		});
};

const filterNearbyCandidates = isInVariantSynchronous(
	spacefinderOkr1FilterNearby,
	'variant',
)
	? filterNearbyCandidatesFixed
	: filterNearbyCandidatesBroken;

const isDotcomRendering = config.get('isDotcomRendering', false);
const articleBodySelector = isDotcomRendering
	? '.article-body-commercial-selector'
	: '.js-article__body';

const addDesktopInlineAds = (isInline1) => {
	const isImmersive = config.get('page.isImmersive');
	const defaultRules = {
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
	const relaxedRules = {
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

	const insertAds = (paras) => {
		const slots = paras
			.slice(0, isInline1 ? 1 : paras.length)
			.map((para, i) => {
				const inlineId = i + (isInline1 ? 1 : 2);

				if (sfdebug) {
					para.style.cssText += 'border: thick solid green;';
				}

				return insertAdAtPara(
					para,
					`inline${inlineId}`,
					'inline',
					`inline${isInline1 ? '' : ' offset-right'}`,
					isInline1
						? null
						: { desktop: [adSizes.halfPage, adSizes.skyscraper] },
				);
			});

		return Promise.all(slots).then(() => slots.length);
	};

	const enableDebug =
		(sfdebug === '1' && isInline1) || (sfdebug === '2' && !isInline1);

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
		debug: enableDebug,
	});
};

const addMobileInlineAds = () => {
	const rules = {
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
			fromBottom: true,
		},
		filter: filterNearbyCandidates(adSizes.mpu.height),
	};

	const insertAds = (paras) => {
		const slots = paras.map((para, i) =>
			insertAdAtPara(
				para,
				i === 0 ? 'top-above-nav' : `inline${i}`,
				i === 0 ? 'top-above-nav' : 'inline',
				'inline',
			),
		);

		return Promise.all(slots).then(() => slots.length);
	};

	const enableDebug = sfdebug === '1';

	// This just returns whatever is passed in the second argument
	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
		debug: enableDebug,
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

	const rules = {
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

	return spaceFiller.fillSpace(
		rules,
		(paras) => insertAdAtPara(paras[0], 'im', 'im').then(() => true),
		{
			waitForImages: true,
			waitForLinks: true,
			waitForInteractives: true,
		},
	);
};

const doInit = () => {
	if (!commercialFeatures.articleBodyAdverts) {
		return Promise.resolve(false);
	}

	const im = config.get('page.hasInlineMerchandise')
		? attemptToAddInlineMerchAd()
		: Promise.resolve(false);
	im.then((inlineMerchAdded) =>
		inlineMerchAdded ? trackAdRender('dfp-ad--im') : Promise.resolve(),
	)
		.then(addInlineAds)
		.then(initCarrot);

	return im;
};

/**
 * Initialise article body ad slots
 */
export const init = () => {
	// Also init when the main article is redisplayed
	// For instance by the signin gate.
	mediator.on('page:article:redisplayed', doInit);
	// DCR doesn't have mediator, so listen for CustomEvent
	document.addEventListener('dcr:page:article:redisplayed', doInit);
	return doInit();
};
