import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/once';
import qwery from 'qwery';

const shouldDisableAdSlot = (adSlot) =>
    window.getComputedStyle(adSlot).display === 'none';

const closeDisabledSlots = once(
    (): Promise<void> => {
        // Get all ad slots
        let adSlots: Element[] = qwery(dfpEnv.adSlotSelector);

        // remove the ones which should not be there
        adSlots = adSlots.filter(shouldDisableAdSlot);

        return fastdom.mutate(() => {
            adSlots.forEach((adSlot: Element) => adSlot.remove());
        });
    }
);

export { closeDisabledSlots };
