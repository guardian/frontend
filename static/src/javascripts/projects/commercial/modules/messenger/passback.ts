import { adSlotIdPrefix } from '../dfp/dfp-env-globals';
import type { RegisterListener } from '../messenger';

const slotId = `${adSlotIdPrefix}-inline1`;

const init = (register: RegisterListener): void => {
	register('passback', () => {
		window.googletag.cmd.push(function () {
			const slot = window.googletag.defineSlot(
				'/59666047/theguardian.com/x-passback/teads',
				[300, 250],
				slotId,
			);
			if (slot) {
				slot.addService(googletag.pubads());
				slot.setTargeting('passback', ['teads']);
				window.googletag.enableServices();
				window.googletag.display(slotId);
			}
		});
	});
};

export { init };
