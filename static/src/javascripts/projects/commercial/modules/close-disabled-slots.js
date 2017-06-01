// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import { commercialFeatures } from 'commercial/modules/commercial-features';

const adSlotSelector: string = '.js-ad-slot';
const mpuCandidateClass: string = 'fc-slice__item--mpu-candidate';
const mpuHiderClass: string = 'fc-slice__item--no-mpu';
const mpuCandidateSelector: string = `.${mpuCandidateClass}`;

const shouldDisableAdSlotWhenAdFree = adSlot =>
    commercialFeatures.adFree &&
    (adSlot.className.toLowerCase().includes(mpuCandidateClass) ||
        !adSlot.className.toLowerCase().includes('merchandising'));

const shouldDisableAdSlot = adSlot =>
    shouldDisableAdSlotWhenAdFree(adSlot) ||
    window.getComputedStyle(adSlot).display === 'none';

const closeDisabledSlots = (force: boolean): Promise<void> => {
    // Get all ad slots
    let adSlots: Array<Element> = qwery(adSlotSelector);
    let mpuCandidates: Array<Element> = qwery(mpuCandidateSelector);

    if (!force) {
        // remove the ones which should not be there
        adSlots = adSlots.filter(shouldDisableAdSlot);
        mpuCandidates = mpuCandidates.filter(shouldDisableAdSlot);
    }

    return fastdom.write(
        () => adSlots.forEach((adSlot: Element) => adSlot.remove()),
        mpuCandidates.forEach((candidate: Element) =>
            candidate.classList.add(mpuHiderClass)
        )
    );
};

export { closeDisabledSlots };
