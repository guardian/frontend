// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import commercialFeatures from 'commercial/modules/commercial-features';

const adSlotSelector: string = '.js-ad-slot';
const mpuCandidateSelector: string = '.fc-slice__item--mpu-candidate';

const shouldDisableAdSlotWhenAdFree = adSlot =>
    commercialFeatures.adFree &&
    !adSlot.className.toLowerCase().contains('merchandising');

const shouldDisableAdSlot = adSlot =>
    window.getComputedStyle(adSlot).display === 'none' ||
    shouldDisableAdSlotWhenAdFree(adSlot);

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

const closeAdFreeDisabledSlots = (): Promise<void> => {
    const mpuCandidates: Array<Element> = qwery(mpuCandidateSelector).filter(
        shouldDisableAdSlotWhenAdFree
    );
    return fastdom.write(() =>
        mpuCandidates.forEach((candidate: Element) =>
            candidate.classList.add('fc-slice__item--no-mpu')
        )
    );
};

export { closeDisabledSlots, closeAdFreeDisabledSlots };
