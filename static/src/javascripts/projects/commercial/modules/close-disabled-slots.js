import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/once';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

const shouldDisableAdSlot = adSlot =>
    window.getComputedStyle(adSlot).display === 'none';

const closeDisabledSlots = once(
    () => {
        // Get all ad slots
        let adSlots = qwery(dfpEnv.adSlotSelector);

        // remove the ones which should not be there
        adSlots = adSlots.filter(shouldDisableAdSlot);

        return fastdom.mutate(() => {
            adSlots.forEach((adSlot) => adSlot.remove());
        });
    }
);

export { closeDisabledSlots };
