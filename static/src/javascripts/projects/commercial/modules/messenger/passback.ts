import { log } from '@guardian/libs';
import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

type PassbackMessagePayload = {
	source: string;
};

const getValuesForKeys = (
	keys: string[],
	valueFn: (key: string) => string[],
): Array<[string, string[]]> =>
	keys.reduce((acc: Array<[string, string[]]>, key: string) => {
		acc.push([key, valueFn(key)]);
		return acc;
	}, []);

/**
 * A listener for 'passback' messages from ad slot iFrames
 * Ad providers will invoke 'passback' to tell us they have not filled this slot
 * In which case we need to refresh the slot with another ad
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
					iFrameContainer.style.visibility = 'hidden';
				}
				if (slotElement) {
					// TODO: this should be promoted to default styles for inline1
					slotElement.style.position = 'relative';
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
					passbackElement.style.top = '24px';
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
						const passbackSlot = googletag.defineSlot(
							slot.getAdUnitPath(),
							[300, 250],
							passbackElement.id,
						);
						passbackSlot?.addService(window.googletag.pubads());
						allTargeting.forEach(([key, value]) => {
							slot.setTargeting(key, value);
						});
						googletag.display(passbackElement.id);
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
