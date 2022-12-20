import type { AdSize, SizeMapping } from '@guardian/commercial-core';
import { adSizes, createAdSlot } from '@guardian/commercial-core';
import { createAdvertBorder } from 'common/modules/spacefinder-debug-tools';
import {
	getCurrentBreakpoint,
	getCurrentTweakpoint,
} from 'lib/detect-breakpoint';
import { getUrlVars } from 'lib/url';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import type {
	RuleSpacing,
	SpacefinderItem,
	SpacefinderRules,
	SpacefinderWriter,
} from '../../common/modules/spacefinder';
import { initCarrot } from './carrot-traffic-driver';
import { addSlot } from './dfp/add-slot';
import { waitForAdvert } from './dfp/wait-for-advert';
import { computeStickyHeights, insertHeightStyles } from './sticky-inlines';

type SlotName = Parameters<typeof createAdSlot>[0];

type ContainerOptions = {
	sticky?: boolean;
	enableDebug?: boolean;
	className?: string;
};

const articleBodySelector = '.article-body-commercial-selector';

const sfdebug = getUrlVars().sfdebug;

const isPaidContent = window.guardian.config.page.isPaidContent;

const hasImages = !!window.guardian.config.page.lightboxImages?.images.length;

const hasShowcaseMainElement =
	window.guardian.config.page.hasShowcaseMainElement;

const adSlotContainerClass = 'ad-slot-container';

const adSlotContainerRules: RuleSpacing = {
	minAbove: 500,
	minBelow: 500,
};

/**
 * Get the classname for an ad slot container
 *
 * We add 2 to the index because these are always ads added in the second pass.
 *
 * e.g. the 0th container inserted in pass 2 will have suffix `-2` to match `inline2`
 *
 * @param i Index of winning paragraph
 * @returns The classname for container
 */
const getStickyContainerClassname = (i: number) =>
	`${adSlotContainerClass}-${i + 2}`;

const wrapSlotInContainer = (
	ad: HTMLElement,
	options: ContainerOptions = {},
) => {
	const container = document.createElement('div');

	container.className = `${adSlotContainerClass} ${options.className ?? ''}`;

	if (options.enableDebug) {
		createAdvertBorder(container);
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
	containerOptions: ContainerOptions = {},
): Promise<void> => {
	const ad = createAdSlot(type, {
		name,
		classes,
	});

	const node = wrapSlotInContainer(ad, containerOptions);

	return fastdom
		.mutate(() => {
			if (para.parentNode) {
				para.parentNode.insertBefore(node, para);
			}
		})
		.then(() => {
			const shouldForceDisplay = ['im', 'carrot'].includes(name);
			addSlot(ad, shouldForceDisplay, sizes);
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
			adSlotContainerRules.minBelow
		);
	};

/**
 * Decide whether we have enough space to add additional sizes for a given advert.
 * This function ensures we don't insert large height ads at the bottom of articles,
 * when there's not enough room.
 *
 * This is a hotfix to prevent adverts at the bottom of articles pushing down content.
 * Nudge @chrislomaxjones if you're reading this in 2023
 */
const decideAdditionalSizes = async (
	winningPara: HTMLElement,
	sizes: AdSize[],
	isLastInline: boolean,
): Promise<AdSize[]> => {
	// If this ad isn't the last inline then return all additional sizes
	if (!isLastInline) {
		return sizes;
	}

	// Compute the vertical distance from the TOP of the winning para to the BOTTOM of the article body
	const distanceFromBottom = await fastdom.measure(() => {
		const paraTop = winningPara.getBoundingClientRect().top;
		const articleBodyBottom = document
			.querySelector<HTMLElement>(articleBodySelector)
			?.getBoundingClientRect().bottom;

		return articleBodyBottom
			? Math.abs(paraTop - articleBodyBottom)
			: undefined;
	});

	// Return all of the sizes that will fit in the distance to bottom
	return sizes.filter((adSize) =>
		distanceFromBottom ? distanceFromBottom >= adSize.height : false,
	);
};

const addDesktopInlineAds = (isInline1: boolean): Promise<boolean> => {
	const tweakpoint = getCurrentTweakpoint();
	const hasLeftCol = ['leftCol', 'wide'].includes(tweakpoint);

	const ignoreList = hasLeftCol
		? ` > :not(p):not(h2):not(.${adSlotContainerClass}):not(#sign-in-gate):not(.sfdebug):not([data-spacefinder-role="richLink"])`
		: ` > :not(p):not(h2):not(.${adSlotContainerClass}):not(#sign-in-gate):not(.sfdebug)`;

	const isImmersive = window.guardian.config.page.isImmersive;

	const firstInlineRules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: isImmersive ? 700 : 300,
		minBelow: 300,
		selectors: {
			' > h2': {
				minAbove: 5,
				minBelow: 190,
			},
			[` .${adSlotContainerClass}`]: adSlotContainerRules,
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

	let minAbove = 1000;

	/**
	 * In special cases, inline2 can overlap the "Most viewed" island, so
	 * we need to make an adjustment to move the inline2 further down the page.
	 */
	if (isPaidContent) {
		minAbove += 600;
	}
	// Some old articles don't have a main image, which means the first paragraph is much higher
	if (!hasImages) {
		minAbove += 600;
	} else if (hasShowcaseMainElement) {
		minAbove += 100;
	}

	const subsequentInlineRules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove,
		minBelow: 300,
		selectors: {
			[` .${adSlotContainerClass}`]: adSlotContainerRules,
			' [data-spacefinder-role="immersive"]': {
				minAbove: 0,
				minBelow: 600,
			},
		},
		filter: filterNearbyCandidates(adSizes.halfPage.height),
	};

	const rules = isInline1 ? firstInlineRules : subsequentInlineRules;

	const enableDebug =
		(sfdebug === '1' && isInline1) || (sfdebug === '2' && !isInline1);

	const insertAds: SpacefinderWriter = async (paras) => {
		// Make ads sticky on the non-inline1 pass
		// i.e. inline2, inline3, etc...
		const isSticky = !isInline1;

		if (isSticky) {
			const stickyContainerHeights = await computeStickyHeights(
				paras,
				articleBodySelector,
			);

			void insertHeightStyles(
				stickyContainerHeights.map((height, index) => [
					getStickyContainerClassname(index),
					height,
				]),
			);
		}

		const slots = paras
			.slice(0, isInline1 ? 1 : paras.length)
			.map(async (para, i) => {
				const inlineId = i + (isInline1 ? 1 : 2);
				const isLastInline = i === paras.length - 1;

				let containerClasses = '';

				if (isSticky) {
					containerClasses += getStickyContainerClassname(i);
				}

				if (!isInline1) {
					containerClasses +=
						' offset-right ad-slot--offset-right ad-slot-container--offset-right';
				}

				const containerOptions = {
					sticky: isSticky,
					className: containerClasses,
					enableDebug,
				};

				return insertAdAtPara(
					para,
					`inline${inlineId}`,
					'inline',
					'inline',
					// these are added here and not in size mappings because the inline[i] name is also used on fronts, where we don't want outstream or tall ads
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
						: {
								desktop: await decideAdditionalSizes(
									para,
									[adSizes.halfPage, adSizes.skyscraper],
									isLastInline,
								),
						  },
					containerOptions,
				);
			});

		await Promise.all(slots);
	};

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
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
			[` .${adSlotContainerClass}`]: adSlotContainerRules,
			[` > :not(p):not(h2):not(.${adSlotContainerClass}):not(#sign-in-gate):not(.sfdebug)`]:
				{
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
				// Add the mobile portrait interstitial size to inline1 and inline2
				i == 1 || i == 2
					? {
							mobile: [adSizes.portraitInterstitial],
					  }
					: undefined,
			),
		);
		await Promise.all(slots);
	};

	const enableDebug = sfdebug === '1';

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForInteractives: true,
		debug: enableDebug,
	});
};

const addInlineAds = (): Promise<boolean> => {
	const isMobile = getCurrentBreakpoint() === 'mobile';

	if (isMobile) {
		return addMobileInlineAds();
	}
	if (isPaidContent) {
		return addDesktopInlineAds(false);
	}
	return addDesktopInlineAds(true).then(() => addDesktopInlineAds(false));
};

const attemptToAddInlineMerchAd = (): Promise<boolean> => {
	const breakpoint = getCurrentBreakpoint();
	const isMobileOrTablet = breakpoint === 'mobile' || breakpoint === 'tablet';

	const rules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: 300,
		minBelow: 300,
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
			[` .${adSlotContainerClass}`]: adSlotContainerRules,
			[` > :not(p):not(h2):not(.${adSlotContainerClass}):not(#sign-in-gate):not(.sfdebug)`]:
				{
					minAbove: 200,
					minBelow: 400,
				},
		},
	};

	const enableDebug = sfdebug === 'im';

	const insertAds: SpacefinderWriter = (paras) =>
		insertAdAtPara(
			paras[0],
			'im',
			'im',
			'',
			{},
			{
				className: 'ad-slot-container--im',
			},
		);

	return spaceFiller.fillSpace(rules, insertAds, {
		waitForImages: true,
		waitForInteractives: true,
		debug: enableDebug,
	});
};

const doInit = async (): Promise<boolean> => {
	if (!commercialFeatures.articleBodyAdverts) {
		return Promise.resolve(false);
	}

	const im = window.guardian.config.page.hasInlineMerchandise
		? attemptToAddInlineMerchAd()
		: Promise.resolve(false);
	const inlineMerchAdded = await im;
	if (inlineMerchAdded) await waitForAdvert('dfp-ad--im');
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
