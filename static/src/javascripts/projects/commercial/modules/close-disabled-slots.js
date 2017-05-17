// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';

const adSlotSelector = '.js-ad-slot';

const shouldDisableAdSlot = adSlot =>
    window.getComputedStyle(adSlot).display === 'none';

const init = (force: boolean) => {
    // Get all ad slots
    let adSlots = qwery(adSlotSelector);

    if (!force) {
        // remove the ones which should not be there
        adSlots = adSlots.filter(shouldDisableAdSlot);
    }

    return fastdom.write(() => {
        adSlots.forEach(adSlot => {
            if (adSlot.parentNode) {
                adSlot.parentNode.removeChild(adSlot);
            }
        });
    });
};

export default {
    init,
};
