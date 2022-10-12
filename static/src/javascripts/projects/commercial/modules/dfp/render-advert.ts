import {
	adSizes,
	constants,
	slotSizeMappings,
	standardAdSizes,
} from '@guardian/commercial-core';
import { $$ } from '../../../../lib/$$';
import fastdom from '../../../../lib/fastdom-promise';
import reportError from '../../../../lib/report-error';
import type { Advert } from './Advert';
import { getAdIframe } from './get-ad-iframe';
import { renderAdvertLabel } from './render-advert-label';

/**
 * ADVERT RENDERING
 * ----------------
 *
 * Most adverts come back from DFP ready to display as-is. But sometimes we need more: embedded components that can share
 * Guardian styles, for example, or behaviours like sticky-scrolling. This module helps 'finish' rendering any advert, and
 * decorates them with these behaviours.
 *
 */

/**
 * Types of events that are returned when executing a size change callback
 */
const addClassIfHasClass = (newClassNames: string[]) =>
	function hasClass(classNames: string[]) {
		return function onAdvertRendered(advert: Advert) {
			if (
				classNames.some((className) =>
					advert.node.classList.contains(className),
				)
			) {
				return fastdom.mutate(() => {
					newClassNames.forEach((className) => {
						advert.node.classList.add(className);
					});
				});
			}
			return Promise.resolve();
		};
	};

const addFluid250 = addClassIfHasClass(['ad-slot--fluid250']);
const addFluid = addClassIfHasClass(['ad-slot--fluid']);

const removeStyleFromAdIframe = (
	advert: { node: HTMLElement },
	style: string,
) => {
	const adIframe = advert.node.querySelector('iframe');

	void fastdom.mutate(() => {
		if (adIframe) {
			adIframe.style.removeProperty(style);
		}
	});
};

type SizeCallback = (
	arg0: Advert,
	arg1?: googletag.events.SlotRenderEndedEvent,
) => Promise<void>;
const sizeCallbacks: Record<string, undefined | SizeCallback> = {};

/**
 * DFP fluid ads should use existing fluid-250 styles in the top banner position
 * The vertical-align property found on DFP iframes affects the smoothness of
 * CSS transitions when expanding/collapsing various native style formats.
 */
sizeCallbacks[adSizes.fluid.toString()] = (advert: Advert) =>
	addFluid(['ad-slot'])(advert).then(() =>
		removeStyleFromAdIframe(advert, 'vertical-align'),
	);

sizeCallbacks[adSizes.mpu.toString()] = (advert: Advert): Promise<void> =>
	advert.updateExtraSlotClasses();

sizeCallbacks[adSizes.halfPage.toString()] = (advert: Advert) =>
	advert.updateExtraSlotClasses();

sizeCallbacks[adSizes.skyscraper.toString()] = (advert: Advert) =>
	advert.updateExtraSlotClasses('ad-slot--sky');

sizeCallbacks[adSizes.outstreamDesktop.toString()] = (advert: Advert) =>
	advert.updateExtraSlotClasses('ad-slot--outstream');

sizeCallbacks[adSizes.outstreamGoogleDesktop.toString()] = (advert: Advert) =>
	advert.updateExtraSlotClasses('ad-slot--outstream');

sizeCallbacks[adSizes.outstreamMobile.toString()] = (advert: Advert) =>
	advert.updateExtraSlotClasses('ad-slot--outstream');

sizeCallbacks[adSizes.googleCard.toString()] = (advert: Advert) =>
	advert.updateExtraSlotClasses('ad-slot--gc');

/**
 * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
 * and their containers closed up.
 */
const outOfPageCallback = (advert: Advert) => {
	const parent = advert.node.parentNode as HTMLElement;
	return fastdom.mutate(() => {
		advert.node.classList.add('ad-slot--collapse');
		// Special case for top-above-nav which has a container with its own height
		if (advert.id.includes('top-above-nav')) {
			const adContainer = advert.node.closest<HTMLElement>(
				'.top-banner-ad-container',
			);
			if (adContainer) {
				adContainer.style.display = 'none';
			}
		}
		// if in a slice, add the 'no mpu' class
		if (parent.classList.contains('fc-slice__item--mpu-candidate')) {
			parent.classList.add('fc-slice__item--no-mpu');
		}
	});
};
sizeCallbacks[adSizes.outOfPage.toString()] = outOfPageCallback;
sizeCallbacks[adSizes.empty.toString()] = outOfPageCallback;

/**
 * Commercial components with merch sizing get fluid-250 styling
 */
sizeCallbacks[adSizes.merchandising.toString()] = addFluid250([
	'ad-slot--commercial-component',
]);

const addContentClass = (adSlotNode: HTMLElement) => {
	const adSlotContent = $$(
		`#${adSlotNode.id} > div:not(.ad-slot__label)`,
		adSlotNode,
	).get();

	if (adSlotContent.length) {
		void fastdom.mutate(() => {
			adSlotContent[0].classList.add('ad-slot__content');
		});
	}
};

/**
 * Avoid CLS when an advert is refreshed, by setting the
 * min-height of the ad slot to the height of the ad.
 *
 * Doesn't work for fluid ads, because we don't know the height of a fluid ad at this point.
 */
const setMinHeightOfAdSlot = (advert: Advert): void => {
	if (
		advert.id !== 'dfp-ad--top-above-nav' ||
		advert.size === null ||
		advert.size === 'fluid'
	) {
		return;
	}

	const { height: adHeight, width: adWidth } = advert.size;

	// Ensure that we know the height of the ad, i.e. the ad does not have variable dimensions
	const isStandardAdSize = Object.values(standardAdSizes).some(
		(adSize) => adSize.height === adHeight,
	);

	// Only set min-height for desktop ad sizes
	const isDesktopAdSize = slotSizeMappings['top-above-nav'].desktop?.some(
		({ height, width }) => height === adHeight && width === adWidth,
	);

	if (isStandardAdSize && isDesktopAdSize) {
		void fastdom.mutate(() => {
			const adSlotHeight = adHeight + constants.AD_LABEL_HEIGHT;
			advert.node.setAttribute('style', `min-height:${adSlotHeight}px`);
		});
	}
};

/**
 * @param advert - as defined in commercial/modules/dfp/Advert
 * @param slotRenderEndedEvent - GPT slotRenderEndedEvent
 * @returns {Promise} - resolves once all necessary rendering is queued up
 */
export const renderAdvert = (
	advert: Advert,
	slotRenderEndedEvent: googletag.events.SlotRenderEndedEvent,
): Promise<boolean> => {
	addContentClass(advert.node);
	setMinHeightOfAdSlot(advert);

	return getAdIframe(advert.node)
		.then((isRendered) => {
			const callSizeCallback = () => {
				if (advert.size) {
					/**
					 * We reset hasPrebidSize to the default value of false for
					 * subsequent ad refreshes as they may not be prebid ads.
					 * */
					advert.hasPrebidSize = false;

					const sizeCallback = sizeCallbacks[advert.size.toString()];
					return Promise.resolve(
						sizeCallback !== undefined
							? sizeCallback(advert, slotRenderEndedEvent)
							: advert.updateExtraSlotClasses(),
					);
				}

				return Promise.resolve();
			};

			const addRenderedClass = () =>
				isRendered
					? fastdom.mutate(() => {
							advert.node.classList.add('ad-slot--rendered');
					  })
					: Promise.resolve();

			return callSizeCallback()
				.then(() => renderAdvertLabel(advert.node))
				.then(addRenderedClass)
				.then(() => isRendered);
		})
		.catch((err) => {
			reportError(
				err,
				{
					feature: 'commercial',
				},
				false,
			);

			return Promise.resolve(false);
		});
};
