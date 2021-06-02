import { $$ } from '../../../../lib/$$';
import fastdom from '../../../../lib/fastdom-promise';
import reportError from '../../../../lib/report-error';
import { geoMostPopular } from '../../../common/modules/onward/geo-most-popular';
import { adSizes } from '../ad-sizes';
import { stickyCommentsMpu, stickyMpu } from '../sticky-mpu';
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

const addClassIfHasClass = (newClassNames: string[]) =>
	function hasClass(classNames: string[]) {
		return function onAdvertRendered(_: any, advert: Advert) {
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

const removeStyleFromAdIframe = (advert: { node: HTMLElement }, style: any) => {
	const adIframe = advert.node.querySelector('iframe');

	void fastdom.mutate(() => {
		if (adIframe) {
			adIframe.style.removeProperty(style);
		}
	});
};

const sizeCallbacks: Record<
	string,
	undefined | ((arg1: any, arg2: Advert) => Promise<void>)
> = {};

/**
 * DFP fluid ads should use existing fluid-250 styles in the top banner position
 * The vertical-align property found on DFP iframes affects the smoothness of
 * CSS transitions when expanding/collapsing various native style formats.
 */
sizeCallbacks[adSizes.fluid.toString()] = (
	renderSlotEvent: any,
	advert: Advert,
) =>
	addFluid(['ad-slot'])(renderSlotEvent, advert).then(() =>
		removeStyleFromAdIframe(advert, 'vertical-align'),
	);

/**
 * Trigger sticky scrolling for MPUs in the right-hand article column
 */
sizeCallbacks[adSizes.mpu.toString()] = (
	_: any,
	advert: Advert,
): Promise<any> =>
	fastdom.measure(() => {
		if (advert.node.classList.contains('js-sticky-mpu')) {
			if (advert.node.classList.contains('ad-slot--right')) {
				stickyMpu(advert.node);
			}
			if (advert.node.classList.contains('ad-slot--comments')) {
				stickyCommentsMpu(advert.node);
			}
		}
		void fastdom.mutate(() => advert.updateExtraSlotClasses());
	});

/**
 * Resolve the stickyMpu.whenRendered promise
 */
sizeCallbacks[adSizes.halfPage.toString()] = (_: any, advert: Advert) =>
	fastdom.measure(() => {
		if (advert.node.classList.contains('ad-slot--right')) {
			stickyMpu(advert.node);
		}
		if (advert.node.classList.contains('ad-slot--comments')) {
			stickyCommentsMpu(advert.node);
		}
		void fastdom.mutate(() => advert.updateExtraSlotClasses());
	});

sizeCallbacks[adSizes.skyscraper.toString()] = (_: any, advert: Advert) =>
	fastdom.measure(() => {
		if (advert.node.classList.contains('ad-slot--right')) {
			stickyMpu(advert.node);
		}
		if (advert.node.classList.contains('ad-slot--comments')) {
			stickyCommentsMpu(advert.node);
		}
		void fastdom.mutate(() =>
			advert.updateExtraSlotClasses('ad-slot--sky'),
		);
	});

sizeCallbacks[adSizes.video.toString()] = (_: any, advert: Advert) =>
	fastdom.mutate(() => {
		advert.updateExtraSlotClasses('u-h');
	});

sizeCallbacks[adSizes.outstreamDesktop.toString()] = (_: any, advert: Advert) =>
	fastdom.mutate(() => {
		advert.updateExtraSlotClasses('ad-slot--outstream');
	});

sizeCallbacks[adSizes.outstreamGoogleDesktop.toString()] = (
	_: any,
	advert: Advert,
) =>
	fastdom.mutate(() => {
		advert.updateExtraSlotClasses('ad-slot--outstream');
	});

sizeCallbacks[adSizes.outstreamMobile.toString()] = (_: any, advert: Advert) =>
	fastdom.mutate(() => {
		advert.updateExtraSlotClasses('ad-slot--outstream');
	});

sizeCallbacks[adSizes.googleCard.toString()] = (_: any, advert: Advert) =>
	fastdom.mutate(() => {
		advert.updateExtraSlotClasses('ad-slot--gc');
	});

/**
 * Out of page adverts - creatives that aren't directly shown on the page - need to be hidden,
 * and their containers closed up.
 */
const outOfPageCallback = (
	event: {
		slot: {
			getOutOfPage: () => unknown;
		};
	},
	advert: Advert,
) => {
	if (!event.slot.getOutOfPage()) {
		const parent = advert.node.parentNode as HTMLElement;
		return fastdom.mutate(() => {
			advert.node.classList.add('u-h');
			// if in a slice, add the 'no mpu' class
			if (parent.classList.contains('fc-slice__item--mpu-candidate')) {
				parent.classList.add('fc-slice__item--no-mpu');
			}
		});
	}
	return Promise.resolve();
};
sizeCallbacks[adSizes.outOfPage.toString()] = outOfPageCallback;
sizeCallbacks[adSizes.empty.toString()] = outOfPageCallback;

/**
 * Portrait adverts exclude the locally-most-popular widget
 */
// Temporary definition until 'geo-most-popular' is converted to TypeScript

type WrappedElem = {
	elem: HTMLElement | null;
	remove: () => void;
};
sizeCallbacks[adSizes.portrait.toString()] = () =>
	// remove geo most popular
	geoMostPopular.whenRendered.then(
		(popular: WrappedElem | undefined | null) =>
			fastdom.mutate(() => {
				if (popular?.elem) {
					popular.elem.remove();
					popular.elem = null;
				}
			}),
	);

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
 * @param advert - as defined in commercial/modules/dfp/Advert
 * @param slotRenderEndedEvent - GPT slotRenderEndedEvent
 * @returns {Promise} - resolves once all necessary rendering is queued up
 */
export const renderAdvert = (
	advert: Advert,
	slotRenderEndedEvent: Event,
): Promise<any> => {
	addContentClass(advert.node);

	return getAdIframe(advert.node)
		.then((isRendered) => {
			const callSizeCallback = (): Promise<any> => {
				if (advert.size) {
					let size = advert.size.toString();

					if (size === '0,0') {
						size = 'fluid';
					}

					/**
					 * we reset hasPrebidSize to the default
					 * value of false for subsequent ad refreshes
					 * as they may not be prebid ads.
					 * */
					advert.hasPrebidSize = false;

					return Promise.resolve(
						sizeCallbacks[size]
							? // @ts-expect-error - We check if sizeCallbacks[size] is truthy above
							  sizeCallbacks[size](slotRenderEndedEvent, advert)
							: fastdom.mutate(() => {
									advert.updateExtraSlotClasses();
							  }),
					);
				}
				return Promise.resolve(null);
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
