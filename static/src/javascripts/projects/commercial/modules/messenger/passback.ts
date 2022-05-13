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
 * In which case we create a 'passback' slot with another ad
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
					'Passback listener: message does not have source set',
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
					'Passback listener: cannot determine the calling iFrame',
				);
			}

			if (iframe) {
				const iFrameContainer =
					iframe.closest<HTMLDivElement>('.ad-slot__content');

				if (iFrameContainer) {
					/**
					 * Keep the initial outstream iFrame so they can detect passbacks.
					 * Maintain the iFrame initial size by setting visibility to prevent CLS.
					 * In a full width column we only then need to resize height.
					 */
					iFrameContainer.style.visibility = 'hidden';
					/**
					 * In lieu of https://github.com/guardian/dotcom-rendering/pull/4506
					 * which changes inline1 to take the full width of the column, the ad
					 * will float right. In which case we have to remove the initial
					 * iFrame from document flow and set the width once known.
					 */
					// iFrameContainer.style.display = 'none';
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
				 * Find the live slot object from googletag
				 */
				const slot = window.googletag
					.pubads()
					.getSlots()
					.find((s) => s.getSlotElementId() === slotIdWithPrefix);

				if (slot) {
					/**
					 * Copy the targeting from the previous slot
					 */
					const pageTargeting = getValuesForKeys(
						window.googletag.pubads().getTargetingKeys(),
						(key) => window.googletag.pubads().getTargeting(key),
					);
					const slotTargeting = getValuesForKeys(
						slot.getTargetingKeys(),
						(key) => slot.getTargeting(key),
					);
					const allTargeting: Array<[string, string[]]> = [
						...pageTargeting,
						...slotTargeting,
						['passback', [source]],
						['slot', ['inline']],
					];

					/**
					 * Create a new ad slot element
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
					 * Define and display a new slot
					 */
					window.googletag.cmd.push(() => {
						// https://developers.google.com/publisher-tag/reference#googletag.defineSlot
						const passbackSlot = googletag.defineSlot(
							slot.getAdUnitPath(),
							mpu,
							passbackElement.id,
						);
						// https://developers.google.com/publisher-tag/guides/ad-sizes#responsive_ads
						passbackSlot?.defineSizeMapping([
							[
								[breakpoints.phablet, 0],
								[outstreamDesktop, mpu],
							],
							[
								[breakpoints.mobile, 0],
								[outstreamMobile, mpu],
							],
						]);
						passbackSlot?.addService(window.googletag.pubads());
						allTargeting.forEach(([key, value]) => {
							slot.setTargeting(key, value);
						});
						googletag.display(passbackElement.id);
					});

					/**
					 * Resize the container height when the passback has loaded.
					 * We need to do this because the passback ad is absolutely
					 * positioned in order to not layout shift. Therefore it is
					 * taken out of normal document flow and the parent container
					 * does not take the height of the child ad element as normal.
					 * So we set this by hooking into the googletag slotRenderEnded
					 * event to get the size of the ad loaded.
					 * https://developers.google.com/publisher-tag/reference#googletag.events.slotrenderendedevent
					 */
					googletag
						.pubads()
						.addEventListener('slotRenderEnded', function (event) {
							const slotId = event.slot.getSlotElementId();
							if (slotId === passbackElement.id) {
								const size =
									event.slot.getSizes()[0] as googletag.Size;
								slotElement.style.height = `${
									size.getHeight() + labelHeight
								}px`;
								/**
								 * In lieu of https://github.com/guardian/dotcom-rendering/pull/4506
								 * which changes inline1 to take the full width of the column, the ad
								 * will float right so we have to set the ad width.
								 */
								// slotElement.style.width = `${size.getWidth()}px`;
							}
						});

					log(
						'commercial',
						`Passback listener: passback from ${source} creating slot: ${passbackElement.id}`,
					);
				}
			}
		});
	});
};

export { init };
