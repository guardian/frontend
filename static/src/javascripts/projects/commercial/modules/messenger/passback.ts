import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

type PassbackPayload = {
	slotId: string;
};

const init = (register: RegisterListener): void => {
	register('passback', (payloadFromCreative) => {
		window.googletag.cmd.push(function () {
			const payload = payloadFromCreative as PassbackPayload;
			const { slotId } = payload;
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
				slot.setTargeting('passback', ['teads']);
				slot.setTargeting('slot', slotId);
				window.googletag.pubads().refresh([slot]);
			}
		});
	});
};

export { init };
