import { log } from '@guardian/libs';
import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

type PassbackMessagePayload = {
	source: string;
};

/**
 * A listener for 'passback' messages from ad slot iFrames
 * Ad providers will invoke 'passback' to tell us they have not filled this slot
 * In which case we need to refresh the slot with another ad
 */
const init = (register: RegisterListener): void => {
	register('passback', (messagePayload, ret, iframe) => {
		window.googletag.cmd.push(function () {
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
			const slotId =
				iframe?.closest<HTMLDivElement>('.ad-slot')?.dataset.name;
			if (!slotId) {
				log(
					'commercial',
					'Passback listener: cannot determine the calling iFrame',
				);
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
					 * All viewports >= 0x0 use fixed size 300x250
					 */
					slot.defineSizeMapping([[[0, 0], [[300, 250]]]]);
					/**
					 * Set passback targeting param so the passback line item can negatively target
					 * This ensures that passback line items do not match for this request
					 */
					slot.setTargeting('passback', [source]);
					slot.setTargeting('slot', slotId);
					log(
						'commercial',
						`Passback listener: passback from ${source} refreshing slot: ${slotId}`,
					);
					window.googletag.pubads().refresh([slot]);
				}
			}
		});
	});
};

export { init };
