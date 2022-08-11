import { adSizes, createAdSlot } from '@guardian/commercial-core';
import {
	computeStickyHeights,
	insertHeightStyles,
} from 'commercial/modules/sticky-inlines';
import { spaceFiller } from 'common/modules/article/space-filler';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import type {
	SpacefinderItem,
	SpacefinderRules,
	SpacefinderWriter,
} from 'common/modules/spacefinder';
import { getBreakpoint, getViewport } from 'lib/detect-viewport';
import { getUrlVars } from 'lib/url';
import fastdom from '../../../../../lib/fastdom-promise';
import { defineSlot } from '../define-slot';

type SlotName = Parameters<typeof createAdSlot>[0];

type ContainerOptions = {
	sticky?: boolean;
	enableDebug?: boolean;
	className?: string;
};

const articleBodySelector = '.article-body-commercial-selector';

const adSlotClassSelectorSizes = {
	minAbove: 500,
	minBelow: 500,
};

const sfdebug = getUrlVars().sfdebug;

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
const getStickyContainerClassname = (i: number) => `ad-slot-container-${i + 2}`;

const wrapSlotInContainer = (
	ad: HTMLElement,
	options: ContainerOptions = {},
) => {
	const container = document.createElement('div');

	container.className = `ad-slot-container ${options.className ?? ''}`;

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
			defineSlot(ad.id);
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

const addMobileInlineAds = async () => {
	// TODO
};

const addDesktopInlineAds = async () => {
	// For any other inline
	const rules: SpacefinderRules = {
		bodySelector: articleBodySelector,
		slotSelector: ' > p',
		minAbove: 1000,
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

	const enableDebug = sfdebug === '1';

	const insertAds: SpacefinderWriter = async (paras) => {
		// Make ads sticky in containers if using containers and in sticky test variant
		// Compute the height of containers in which ads will remain sticky
		const includeStickyContainers = !!getUrlVars().multiSticky;

		if (includeStickyContainers) {
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

		const slots = paras.map((para, i) => {
			const inlineId = i + 1;

			if (sfdebug) {
				para.style.cssText += 'border: thick solid green;';
			}

			let containerClasses = '';

			if (includeStickyContainers) {
				containerClasses += getStickyContainerClassname(i);
			}

			if (inlineId !== 1) {
				containerClasses +=
					' offset-right ad-slot--offset-right ad-slot-container--offset-right';
			}

			const containerOptions = {
				sticky: includeStickyContainers,
				className: containerClasses,
				enableDebug,
			};

			return insertAdAtPara(
				para,
				`inline${inlineId}`,
				'inline',
				'inline',
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

const addInlineAds = (): Promise<boolean | void> =>
	getBreakpoint(getViewport().width) === 'mobile'
		? addMobileInlineAds()
		: addDesktopInlineAds();

const initArticleInline = async (): Promise<void> => {
	// do we need to rerun for the sign-in gate?
	if (!commercialFeatures.articleBodyAdverts) {
		return;
	}

	await addInlineAds();
};

export { initArticleInline };
