import { adFreeSlotRemove } from '../projects/commercial/modules/ad-free-slot-remove';
import { removeDisabledSlots as closeDisabledSlots } from '../projects/commercial/modules/remove-slots';
import { init as setAdTestCookie } from '../projects/commercial/modules/set-adtest-cookie';

const init = async (): Promise<void> => {
	await Promise.all([
		setAdTestCookie(),
		adFreeSlotRemove(),
		closeDisabledSlots(),
	]);
};

export { init };
