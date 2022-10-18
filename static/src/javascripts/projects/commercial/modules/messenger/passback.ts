import { adSizes } from '@guardian/commercial-core';
import type { RegisterListener } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { breakpoints } from '@guardian/source-foundations';
import { getCurrentBreakpoint } from 'lib/detect-viewport';
import fastdom from '../../../../lib/fastdom-promise';
import { adSlotIdPrefix } from '../dfp/dfp-env-globals';

type PassbackMessagePayload = { source: string };

const adLabelHeight = 24;

const mpu: [number, number] = [adSizes.mpu.width, adSizes.mpu.height];
const outstreamDesktop: [number, number] = [
	adSizes.outstreamDesktop.width,
	adSizes.outstreamDesktop.height,
];
const outstreamMobile: [number, number] = [
	adSizes.outstreamMobile.width,
	adSizes.outstreamMobile.height,
];

const getValuesForKeys = (
	keys: string[],
	valueFn: (key: string) => string[],
): Array<[string, string[]]> => keys.map((key) => [key, valueFn(key)]);

const getPassbackValue = (source: string): string => {
	const isMobile = getCurrentBreakpoint() === 'mobile';
	// e.g. 'teadsdesktop' or 'teadsmobile';
	return `${source}${isMobile ? 'mobile' : 'desktop'}`;
};

/**
 * A listener for 'passback' messages from ad slot iFrames
 * Ad providers will postMessage a 'passback' message to tell us they have not filled this slot
 * In which case we create a 'passback' slot to fulfil the slot with another ad
 */
const init = (register: RegisterListener): void => {
	register('passback', (messagePayload, ret, iframe) => {
		window.googletag.cmd.push(() => {
			/**
			 * Get the passback source from the incoming message
			 */
			const { source } = messagePayload as PassbackMessagePayload;
			if (!source) {
				log(
					'commercial',
					'Passback: postMessage does not have source set',
				);
				return;
			}

			if (!iframe) {
				log(
					'commercial',
					'Passback: iframe has not been passed by messenger',
				);
				return;
			}

			/**
			 * Determine the slot from the calling iFrame as provided by messenger
			 */
			const slotElement = iframe.closest<HTMLDivElement>('.ad-slot');
			const slotId = slotElement?.dataset.name;

			if (!slotId) {
				log(
					'commercial',
					'Passback: cannot determine the slot from the calling iFrame',
				);
				return;
			}

			const slotIdWithPrefix = `${adSlotIdPrefix}${slotId}`;

			log(
				'commercial',
				`Passback: from source '${source}' for slot '${slotIdWithPrefix}'`,
			);

			const iFrameContainer =
				iframe.closest<HTMLDivElement>('.ad-slot__content');

			if (!iFrameContainer) {
				log(
					'commercial',
					'Passback: cannot determine the iFrameContainer from the calling iFrame',
				);
				return;
			}

			/**
			 * Keep the initial outstream iFrame so they can detect passbacks.
			 * Maintain the iFrame initial size by setting visibility hidden to prevent CLS.
			 * In a full width column we then just need to resize the height.
			 */
			const updateInitialSlotPromise = fastdom.mutate(() => {
				iFrameContainer.style.visibility = 'hidden';
				// TODO: this should be promoted to default styles for the initial slot
				slotElement.style.position = 'relative';
				// Remove any outstream styling for this slot
				slotElement.classList.remove('ad-slot--outstream');
			});

			/**
			 * Create a new passback ad slot element
			 */
			const createNewSlotElementPromise = updateInitialSlotPromise.then(
				() => {
					const passbackElement = document.createElement('div');
					passbackElement.id = `${slotIdWithPrefix}--passback`;
					passbackElement.classList.add('ad-slot', 'js-ad-slot');
					passbackElement.setAttribute('aria-hidden', 'true');
					// position absolute to position over the container slot
					passbackElement.style.position = 'absolute';
					// account for the ad label
					passbackElement.style.top = `${adLabelHeight}px`;
					// take the full width so it will center horizontally
					passbackElement.style.width = '100%';

					return fastdom
						.mutate(() => {
							slotElement.insertAdjacentElement(
								'beforeend',
								passbackElement,
							);
						})
						.then(() => passbackElement.id);
				},
			);

			/**
			 * Create and display the new passback slot
			 */
			void createNewSlotElementPromise.then((passbackElementId) => {
				/**
				 * Find the initial slot object from googletag
				 */
				const initialSlot = window.googletag
					.pubads()
					.getSlots()
					.find((s) => s.getSlotElementId() === slotIdWithPrefix);

				if (!initialSlot) {
					log(
						'commercial',
						'Passback: cannot determine the googletag slot from the slotId',
					);
					return;
				}

				/**
				 * Copy the targeting from the initial slot
				 */
				const pageTargeting = getValuesForKeys(
					window.googletag.pubads().getTargetingKeys(),
					(key) => window.googletag.pubads().getTargeting(key),
				);
				const slotTargeting = getValuesForKeys(
					initialSlot.getTargetingKeys(),
					(key) => initialSlot.getTargeting(key),
				);
				log(
					'commercial',
					'Passback: initial slot targeting',
					Object.fromEntries([...pageTargeting, ...slotTargeting]),
				);

				/**
				 * Create the targeting for the new passback slot
				 */
				const passbackTargeting: Array<[string, string[]]> = [
					...pageTargeting,
					...slotTargeting,
					['passback', [getPassbackValue(source)]],
					['slot', [slotId]],
				];

				/**
				 * Register a listener to adjust the container height once the
				 * passback has loaded. We need to do this because the passback
				 * ad is absolutely positioned in order to not cause layout shift.
				 * So it is taken out of normal document flow and the parent container
				 * does not take the height of the child ad element as normal.
				 * We set the container height by adding a listener to the googletag
				 * slotRenderEnded event which provides the size of the loaded ad.
				 * https://developers.google.com/publisher-tag/reference#googletag.events.slotrenderendedevent
				 */
				googletag
					.pubads()
					.addEventListener(
						'slotRenderEnded',
						function (
							event: googletag.events.SlotRenderEndedEvent,
						) {
							const slotId = event.slot.getSlotElementId();
							if (slotId === passbackElementId) {
								const size = event.size;
								if (Array.isArray(size)) {
									const adHeight = size[1];
									log(
										'commercial',
										`Passback: ad height is ${adHeight}`,
									);
									void fastdom.mutate(() => {
										const slotHeight = `${
											adHeight + adLabelHeight
										}px`;
										log(
											'commercial',
											`Passback: setting height of passback slot to ${slotHeight}`,
										);
										slotElement.style.height = slotHeight;

										// Also resize the initial outstream iframe so
										// it doesn't block text selection directly under
										// the new ad
										iframe.style.height = slotHeight;
										iFrameContainer.style.height =
											slotHeight;
									});
								}
							}
						},
					);

				/**
				 * Define and display the new passback slot
				 */
				window.googletag.cmd.push(() => {
					// https://developers.google.com/publisher-tag/reference#googletag.defineSlot
					const passbackSlot = googletag.defineSlot(
						initialSlot.getAdUnitPath(),
						[mpu, outstreamMobile, outstreamDesktop],
						passbackElementId,
					);
					if (passbackSlot) {
						// https://developers.google.com/publisher-tag/guides/ad-sizes#responsive_ads
						passbackSlot.defineSizeMapping([
							[
								[breakpoints.phablet, 0],
								[mpu, outstreamDesktop],
							],
							[
								[breakpoints.mobile, 0],
								[mpu, outstreamMobile],
							],
						]);
						passbackSlot.addService(window.googletag.pubads());
						passbackTargeting.forEach(([key, value]) => {
							passbackSlot.setTargeting(key, value);
						});
						log(
							'commercial',
							'Passback: passback slot targeting map',
							passbackSlot.getTargetingMap(),
						);
						log(
							'commercial',
							`Passback: displaying slot '${passbackElementId}'`,
						);
						googletag.display(passbackElementId);
					}
				});
			});
		});
	});
};

export { init };
