// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/functions/once';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

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
const mpuCandidateSelector: string = `.${mpuCandidateClass}`;

const shouldRemoveAdSlotWhenAdFree = () => commercialFeatures.adFree;

const shouldRemoveMpuWhenAdFree = mpuCandidate =>
    commercialFeatures.adFree &&
    mpuCandidate.className.toLowerCase().includes(mpuCandidateClass);

const shouldRemoveFaciaContainerWhenAdFree = faciaContainer => {
    const dataComponentAttribute = faciaContainer.getAttribute('data-component');
    return (
        commercialFeatures.adFree &&
        dataComponentAttribute &&
        dataComponentAttribute.includes('commercial-container')
    );
};

const adFreeSlotRemove = (): Promise<void> => {
    const adSlotsToRemove: Array<Element> = qwery(dfpEnv.adSlotSelector).filter(
        shouldRemoveAdSlotWhenAdFree
    );

    const mpusToRemove: Array<Element> = qwery(mpuCandidateSelector).filter(
        shouldRemoveMpuWhenAdFree
    );

    const commercialFaciaContainersToRemove: Array<Element> = qwery(
        '.fc-container'
    ).filter(shouldRemoveFaciaContainerWhenAdFree);

    return fastdom.write(() => {
        adSlotsToRemove.forEach((adSlot: Element) => adSlot.remove());
        mpusToRemove.forEach((mpu: Element) =>
            mpu.classList.add('fc-slice__item--no-mpu')
        );
        commercialFaciaContainersToRemove.forEach((faciaContainer: Element) =>
            faciaContainer.classList.add('u-h')
        );
    });
};

export { closeDisabledSlots, adFreeSlotRemove };
