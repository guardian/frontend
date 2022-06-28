import type { SizeMapping } from '@guardian/commercial-core';
import { adSizes, createAdSlot } from '@guardian/commercial-core';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { multiStickyRightAds } from 'common/modules/experiments/tests/multi-sticky-right-ads';
import { getBreakpoint, getTweakpoint, getViewport } from 'lib/detect-viewport';
import { getUrlVars } from 'lib/url';
import config from '../../../lib/config';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import type {
	SpacefinderItem,
	SpacefinderRules,
	SpacefinderWriter,
} from '../../common/modules/spacefinder';
import { initCarrot } from './carrot-traffic-driver';
import { addSlot } from './dfp/add-slot';
import { trackAdRender } from './dfp/track-ad-render';
import { computeStickyHeights, insertHeightStyles } from './sticky-inlines';

type SlotName = Parameters<typeof createAdSlot>[0];

type ContainerOptions = {
	sticky?: boolean;
	enableDebug?: boolean;
	className?: string;
};

const sfdebug = getUrlVars().sfdebug;

const isPaidContent = config.get<boolean>('page.isPaidContent', false);

const adSlotClassSelectorSizes = {
	minAbove: 500,
	minBelow: 500,
};

/**
 * Get the classname for an ad slot container
 *
 * We add 2 to the index because these are always ads added in the second pass.
 *
 * e.g. the 0th container inserted in pass 2 becomes `ad-slot-container--2` to match `inline2`
 *
 * @param i Index of winning paragraph
 * @returns The classname for container
 */
const getContainerClassname = (i: number) => `ad-slot-container-${i + 2}`;

const wrapSlotInContainer = (
	ad: HTMLElement,
	options: ContainerOptions = {},
) => {
	const container = document.createElement('div');
	container.className = `ad-slot-container ad-slot--offset-right ${
		options.className ?? ''
	}`;

	if (options.sticky) {
		ad.style.cssText += 'position: sticky; top: 0;';
	}

	if (options.enableDebug) {
		container.style.cssText += 'outline: 2px solid red;';
	}

	container.appendChild(ad);
	return container;
};

const insertAdAtPara = (
	para: Node,
	name: string,
	type: SlotName,
	classes?: string,
	sizes?: SizeMapping,
	includeContainer?: boolean,
	containerOptions: ContainerOptions = {},
): Promise<void> => {
	const ad = createAdSlot(type, {
		name,
		classes: includeContainer ? '' : classes,
		sizes,
	});

	const node = includeContainer
		? wrapSlotInContainer(ad, containerOptions)
		: ad;

	return fastdom
		.mutate(() => {
			if (para.parentNode) {
				para.parentNode.insertBefore(node, para);
			}
		})
		.then(() => {
			const shouldForceDisplay = ['im', 'carrot'].includes(name);
			addSlot(ad, shouldForceDisplay);
		});
};

// this facilitates a second filtering, now taking into account the candidates' position/size relative to the other candidates
const filterNearbyCandidates =
	(maximumAdHeight: number) =>
	(candidate: SpacefinderItem, lastWinner?: SpacefinderItem): boolean => {
		// No previous winner
		if (lastWinner === undefined) return true;

		return (
			Math.abs(candidate.top - lastWinner.top) - maximumAdHeight >=
			adSlotClassSelectorSizes.minBelow
		);
	};

const articleBodySelector = '.article-body-commercial-selector';

const addDesktopInlineAds = (isInline1: boolean): Promise<boolean> => {
	const tweakpoint = getTweakpoint(getViewport().width);
	const hasLeftCol = ['leftCol', 'wide'].includes(tweakpoint);

	const ignoreList = hasLeftCol
		? ' > :not(p):not(h2):not(.ad-slot):not(#sign-in-gate):not([data-spacefinder-role="richLink"])'
		: ' > :not(p):not(h2):not(.ad-slot):not(#sign-in-gate)';

	const isImmersive = config.get('page.isImmersive');
	const defaultRules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: isImmersive ? 700 : 300,
		minBelow: 300,
		selectors: {
			' > h2': {
				minAbove: 5,
				minBelow: 190,
			},
			' .ad-slot': adSlotClassSelectorSizes,
			[ignoreList]: {
				minAbove: 35,
				minBelow: 400,
			},
			' [data-spacefinder-role="immersive"]': {
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
		minBelow: 300,
		selectors: {
			' .ad-slot': adSlotClassSelectorSizes,
			' [data-spacefinder-role="immersive"]': {
				minAbove: 0,
				minBelow: 600,
			},
		},
		filter: filterNearbyCandidates(adSizes.halfPage.height),
	};

	const rules = isInline1 ? defaultRules : relaxedRules;

	const enableDebug =
		(sfdebug === '1' && isInline1) || (sfdebug === '2' && !isInline1);

	const insertAds: SpacefinderWriter = async (paras) => {
		// Include containers on the non-inline1 pass
		// i.e. inline2, inline3, etc...
		const includeContainer = !isInline1;

		// Make ads sticky in containers if using containers and in sticky test variant
		// Compute the height of containers in which ads will remain sticky
		const includeStickyContainers =
			includeContainer &&
			isInVariantSynchronous(multiStickyRightAds, 'variant');

		if (includeStickyContainers) {
			const stickyContainerHeights = await computeStickyHeights(
				paras,
				articleBodySelector,
			);

			insertHeightStyles(
				stickyContainerHeights.map((height, index) => [
					getContainerClassname(index),
					height,
				]),
			);
		}

		const slots = paras
			.slice(0, isInline1 ? 1 : paras.length)
			.map((para, i) => {
				const inlineId = i + (isInline1 ? 1 : 2);

				if (sfdebug) {
					para.style.cssText += 'border: thick solid green;';
				}

				const containerOptions = includeStickyContainers
					? {
							sticky: true,
							className: getContainerClassname(i),
							enableDebug,
					  }
					: undefined;

				return insertAdAtPara(
					para,
					`inline${inlineId}`,
					'inline',
					`inline${isInline1 ? '' : ' offset-right'}`,
					isInline1
						? {
								phablet: [
									adSizes.outstreamDesktop,
									adSizes.outstreamGoogleDesktop,
								],
								desktop: [
									adSizes.outstreamDesktop,
									adSizes.outstreamGoogleDesktop,
								],
						  }
						: { desktop: [adSizes.halfPage, adSizes.skyscraper] },
					includeContainer,
					containerOptions,
				);
			});
		await Promise.all(slots);
	};

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
		debug: enableDebug,
	});
};

const addMobileInlineAds = (): Promise<boolean> => {
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
			' > :not(p):not(h2):not(.ad-slot):not(#sign-in-gate)': {
				minAbove: 35,
				minBelow: 200,
			},
		},
		filter: filterNearbyCandidates(adSizes.mpu.height),
	};

	const insertAds: SpacefinderWriter = async (paras) => {
		const slots = paras.map((para, i) =>
			insertAdAtPara(
				para,
				i === 0 ? 'top-above-nav' : `inline${i}`,
				i === 0 ? 'top-above-nav' : 'inline',
				'inline',
			),
		);
		await Promise.all(slots);
	};

	const enableDebug = sfdebug === '1';

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForLinks: true,
		waitForInteractives: true,
		debug: enableDebug,
	});
};

const addInlineAds = (): Promise<boolean> => {
	const isMobile = getBreakpoint(getViewport().width) === 'mobile';

	if (isMobile) {
		return addMobileInlineAds();
	}
	if (isPaidContent) {
		return addDesktopInlineAds(false);
	}
	return addDesktopInlineAds(true).then(() => addDesktopInlineAds(false));
};

const attemptToAddInlineMerchAd = (): Promise<boolean> => {
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
			' > :not(p):not(h2):not(.ad-slot):not(#sign-in-gate)': {
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
export const init = (): Promise<boolean> => {
	// Also init when the main article is redisplayed
	// For instance by the signin gate.
	mediator.on('page:article:redisplayed', doInit);
	// DCR doesn't have mediator, so listen for CustomEvent
	document.addEventListener('article:sign-in-gate-dismissed', () => {
		void doInit();
	});
	return doInit();
};
