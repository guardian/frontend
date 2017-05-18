// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';

const adSlotSelector: string = '.js-ad-slot';

const shouldDisableAdSlot = adSlot =>
    window.getComputedStyle(adSlot).display === 'none';

const closeDisabledSlots = (force: boolean): Promise<void> => {
    // Get all ad slots
    let adSlots: qwery = qwery(adSlotSelector);

    if (!force) {
        // remove the ones which should not be there
        adSlots = adSlots.filter(shouldDisableAdSlot);
    }

    return fastdom.write(() => {
        adSlots.forEach((adSlot: Node) => {
            if (adSlot.parentNode) {
                adSlot.parentNode.removeChild(adSlot);
            }
        });
    });
};

export { closeDisabledSlots };
