import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

type PassbackMessagePayload = {
	slotId: string;
	source: string;
};

const init = (register: RegisterListener): void => {
	register('passback', (messagePayload, ret, iframe) => {
		window.googletag.cmd.push(function () {
			const payload = messagePayload as PassbackMessagePayload;
			const { slotId: slotIdFromMessage, source } = payload;
			const slotIdFromIframe =
				iframe?.closest<HTMLDivElement>('.ad-slot')?.dataset.name;
			const slotId = slotIdFromMessage || slotIdFromIframe;
			if (slotId) {
				const slotIdWithPrefix = `${adSlotIdPrefix}${slotId}`;
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
					slot.setTargeting('passback', [source]);
					slot.setTargeting('slot', slotId);
					window.googletag.pubads().refresh([slot]);
				}
			}
		});
	});
};

export { init };
