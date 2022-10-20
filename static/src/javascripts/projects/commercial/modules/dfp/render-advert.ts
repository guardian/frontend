import { adSizes, constants, outstreamSizes } from '@guardian/commercial-core';
import { $$ } from '../../../../lib/$$';
import fastdom from '../../../../lib/fastdom-promise';
import reportError from '../../../../lib/report-error';
import type { Advert } from './Advert';
import { isAdSize } from './Advert';
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
 * Prevent CLS when an advert is refreshed, by setting the
 * min-height of the ad slot to the height of the ad.
 */
const setAdSlotMinHeight = (advert: Advert): void => {
	if (!advert.shouldRefresh || !isAdSize(advert.size)) {
		return;
	}

	const { size, node } = advert;

	// When a passback occurs, a new ad slot is created within the original ad slot.
	// We don't want to set a min-height on the parent ad slot, as the child ad slot
	// may load an ad size that we are not aware of at this point. It may be shorter,
	// which would make the min-height we set here too high.
	// Therefore it is safer to exclude ad slots where a passback may occur.
	const canSlotBePassedBack = Object.values(outstreamSizes).some(
		({ width, height }) => width === size.width && height === size.height,
	);
	if (canSlotBePassedBack) {
		return;
	}

	const isStandardAdSize = !size.isProxy();
	if (isStandardAdSize) {
		const adSlotHeight = size.height + constants.AD_LABEL_HEIGHT;
		void fastdom.mutate(() => {
			node.setAttribute('style', `min-height:${adSlotHeight}px`);
		});
	} else {
		// For the situation when we load a non-standard size ad, e.g. fluid ad, after
		// previously loading a standard size ad. Ensure that the previously added min-height is
		// removed, so that a smaller fluid ad does not have a min-height larger than it is.
		void fastdom.mutate(() => {
			node.setAttribute('style', `min-height:unset`);
		});
	}
};

/**
 * @param advert - as defined in commercial/modules/dfp/Advert
 * @param slotRenderEndedEvent - GPT slotRenderEndedEvent
 * @returns {Promise} - resolves once all necessary rendering is queued up
 */
const renderAdvert = (
	advert: Advert,
	slotRenderEndedEvent: googletag.events.SlotRenderEndedEvent,
): Promise<boolean> => {
	addContentClass(advert.node);

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
				.then(() => setAdSlotMinHeight(advert))
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

export { renderAdvert, setAdSlotMinHeight };
