import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

type PassbackMessagePayload = {
	slotId: string;
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
			const payload = messagePayload as PassbackMessagePayload;
			const { slotId: slotIdFromMessage, source } = payload;
			/**
			 * Attempt to get the slotId from the calling iFrame as provided by messenger
			 */
			const slotIdFromIframe =
				iframe?.closest<HTMLDivElement>('.ad-slot')?.dataset.name;
			const slotId = slotIdFromMessage || slotIdFromIframe;
			if (slotId) {
				const slotIdWithPrefix = `${adSlotIdPrefix}${slotId}`;
				/**
				 * Find the live slot object from googletag
				 */
				const slot = window.googletag
					.pubads()
					.getSlots()
					.find((s) => s.getSlotElementId() === slotIdWithPrefix);
				if (slot) {
					// TODO use size mappings frrom commercial-core
					slot.defineSizeMapping([
						[[1024, 768], [[300, 250]]],
						[[640, 480], [[300, 250]]],
						[[0, 0], []],
					]);
					/**
					 * Set passback targeting param so the passback line item can negatively target
					 * This ensures that passback line items do not match for this request
					 */
					slot.setTargeting('passback', [source]);
					slot.setTargeting('slot', slotId);
					window.googletag.pubads().refresh([slot]);
				}
			}
		});
	});
};

export { init };
