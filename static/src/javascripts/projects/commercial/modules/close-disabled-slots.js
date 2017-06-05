// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/functions/once';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'commercial/modules/commercial-features';

const shouldDisableAdSlot = adSlot =>
    window.getComputedStyle(adSlot).display === 'none';

const closeDisabledSlots = once((): Promise<void> => {
    // Get all ad slots
    let adSlots: Array<Element> = qwery(dfpEnv.adSlotSelector);

    // remove the ones which should not be there
    adSlots = adSlots.filter(shouldDisableAdSlot);

    return fastdom.write(() => {
        adSlots.forEach((adSlot: Element) => adSlot.remove());
    });
});

const mpuCandidateClass: string = 'fc-slice__item--mpu-candidate';
const mpuHiderClass: string = 'fc-slice__item--no-mpu';
const mpuCandidateSelector: string = `.${mpuCandidateClass}`;

const shouldDisableAdSlotWhenAdFree = adSlot =>
    commercialFeatures.adFree &&
    (adSlot.className.toLowerCase().includes(mpuCandidateClass) ||
        !adSlot.className.toLowerCase().includes('merchandising'));

const adFreeSlotRemove = (): Promise<void> => {
    let adSlots: Array<Element> = qwery(dfpEnv.adSlotSelector);
    let mpuCandidates: Array<Element> = qwery(mpuCandidateSelector);

    adSlots = adSlots.filter(shouldDisableAdSlotWhenAdFree);
    mpuCandidates = mpuCandidates.filter(shouldDisableAdSlotWhenAdFree);

    return fastdom.write(
        () => adSlots.forEach((adSlot: Element) => adSlot.remove()),
        mpuCandidates.forEach((candidate: Element) =>
            candidate.classList.add(mpuHiderClass)
        )
    );
};

export { closeDisabledSlots, adFreeSlotRemove };
