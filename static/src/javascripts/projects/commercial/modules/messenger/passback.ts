import { adSizes } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { breakpoints } from '@guardian/source-foundations';
import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

type PassbackMessagePayload = {
	source: string;
};

const getValuesForKeys = (
	keys: string[],
	valueFn: (key: string) => string[],
): Array<[string, string[]]> => keys.map((key) => [key, valueFn(key)]);

const labelHeight = 24;

const mpu: [number, number] = [adSizes.mpu.width, adSizes.mpu.height];
const outstreamDesktop: [number, number] = [
	adSizes.outstreamDesktop.width,
	adSizes.outstreamDesktop.height,
];
const outstreamMobile: [number, number] = [
	adSizes.outstreamMobile.width,
	adSizes.outstreamMobile.height,
];

/**
 * A listener for 'passback' messages from ad slot iFrames
 * Ad providers will postMessage a 'passback' message to tell us they have not filled this slot
 * In which case we create a 'passback' slot to fullfill the slot with another ad
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
			}
			/**
			 * Get the slotId from the calling iFrame as provided by messenger
			 */
			const slotElement = iframe?.closest<HTMLDivElement>('.ad-slot');
			const slotId = slotElement?.dataset.name;
			if (!slotId) {
				log(
					'commercial',
					'Passback: cannot determine the calling iFrame',
				);
			}

			log(
				'commercial',
				`Passback: from ${source} for slot ${String(slotId)}`,
			);

			if (iframe) {
				const iFrameContainer =
					iframe.closest<HTMLDivElement>('.ad-slot__content');

				if (iFrameContainer) {
					/**
					 * Keep the initial outstream iFrame so they can detect passbacks.
					 * Maintain the iFrame initial size by setting visibility hidden to prevent CLS.
					 * In a full width column we then just need to resize the height.
					 */
					iFrameContainer.style.visibility = 'hidden';
				}
				if (slotElement) {
					// TODO: this should be promoted to default styles for inline1
					slotElement.style.position = 'relative';
					// Remove any outstream styling for this slot
					slotElement.classList.remove('ad-slot--outstream');
				}
			}

			if (slotId && source) {
				const slotIdWithPrefix = `${adSlotIdPrefix}${slotId}`;
				/**
				 * Find the initial slot object from googletag
				 */
				const initialSlot = window.googletag
					.pubads()
					.getSlots()
					.find((s) => s.getSlotElementId() === slotIdWithPrefix);

				if (initialSlot) {
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
						'Passback: initial inline1 targeting',
						Object.fromEntries([
							...pageTargeting,
							...slotTargeting,
						]),
					);

					/**
					 * Create the targeting for the new passback slot
					 */
					const passbackTargeting: Array<[string, string[]]> = [
						...pageTargeting,
						...slotTargeting,
						['passback', [source]],
						['slot', ['inline1']],
					];

					/**
					 * Create a new passback ad slot element
					 */
					const passbackElement = document.createElement('div');
					passbackElement.id = `${slotIdWithPrefix}--passback`;
					passbackElement.classList.add('ad-slot', 'js-ad-slot');
					passbackElement.setAttribute('aria-hidden', 'true');
					// position absolute to position over the container slot
					passbackElement.style.position = 'absolute';
					// account for the ad label
					passbackElement.style.top = `${labelHeight}px`;
					// take the full width so it will center horizontally
					passbackElement.style.width = '100%';
					slotElement.insertAdjacentElement(
						'beforeend',
						passbackElement,
					);

					/**
					 * Define and display the new passback slot
					 */
					window.googletag.cmd.push(() => {
						// https://developers.google.com/publisher-tag/reference#googletag.defineSlot
						const passbackSlot = googletag.defineSlot(
							initialSlot.getAdUnitPath(),
							[mpu, outstreamMobile, outstreamDesktop],
							passbackElement.id,
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
								'Passback: passback inline1 targeting map',
								passbackSlot.getTargetingMap(),
							);
							googletag.display(passbackElement.id);
						}
					});

					/**
					 * Resize the container height once the passback has loaded.
					 * We need to do this because the passback ad is absolutely
					 * positioned in order to not add layout shift. So it is
					 * taken out of normal document flow and the parent container
					 * does not take the height of the child ad element as normal.
					 * We set the height by hooking into the googletag slotRenderEnded
					 * event which provides the size of the loaded ad.
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
								if (slotId === passbackElement.id) {
									const size = event.size;
									if (Array.isArray(size)) {
										const height = size[1];
										slotElement.style.height = `${
											height + labelHeight
										}px`;
									}
								}
							},
						);

					log(
						'commercial',
						`Passback: from ${source} creating slot: ${passbackElement.id}`,
					);
				}
			}
		});
	});
};

export { init };
