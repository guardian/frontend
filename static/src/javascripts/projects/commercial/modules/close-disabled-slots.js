// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';

const adSlotSelector: string = '.js-ad-slot';

const shouldDisableAdSlot = adSlot =>
    window.getComputedStyle(adSlot).display === 'none';

const closeDisabledSlots = (force: boolean): Promise<void> => {
    // Get all ad slots
    let adSlots: Array<Element> = qwery(adSlotSelector);

    if (!force) {
        // remove the ones which should not be there
        adSlots = adSlots.filter(shouldDisableAdSlot);
    }

    return fastdom.write(() =>
        adSlots.forEach((adSlot: Element) => adSlot.remove())
    );
};

export { closeDisabledSlots, adSlotSelector };
