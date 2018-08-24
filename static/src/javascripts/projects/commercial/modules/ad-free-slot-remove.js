// @flow
import config from 'lib/config';
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/functions/once';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const mpuCandidateClass: string = 'fc-slice__item--mpu-candidate';
const mpuCandidateSelector: string = `.${mpuCandidateClass}`;

const shouldRemoveMpuWhenAdFree = mpuCandidate =>
    mpuCandidate.className.toLowerCase().includes(mpuCandidateClass);

const shouldRemoveFaciaContainerWhenAdFree = faciaContainer => {
    const dataComponentAttribute = faciaContainer.getAttribute(
        'data-component'
    );
    return (
        dataComponentAttribute &&
        dataComponentAttribute.includes('commercial-container')
    );
};

const obscurePaidForContent = paidContentContainer => {
    if (
        config.page.sponsorshipType &&
        config.page.sponsorshipType === 'paid-content'
    ) {
        return;
    }
    const removeList = [];
    for (
        let child = 0;
        child < paidContentContainer.children.length;
        child += 1
    ) {
        const childElement = paidContentContainer.children[child];
        if (childElement.classList.toString().includes('fc-item__container')) {
            for (
                let grandChild = 0;
                grandChild < childElement.children.length;
                grandChild += 1
            ) {
                const grandChildElement = childElement.children[grandChild];
                if (
                    grandChildElement.classList
                        .toString()
                        .includes('fc-item__media-wrapper') ||
                    grandChildElement.classList
                        .toString()
                        .includes('fc-item__content')
                ) {
                    removeList.push(grandChildElement);
                }
            }
            const cuckooElement: HTMLDivElement = document.createElement('div');
            cuckooElement.innerText = 'Paid-for content hidden. Click to view.';
            cuckooElement.classList.add('fc-item__content');
            childElement.appendChild(cuckooElement);
        }
    }
    for (let remove = 0; remove < removeList.length; remove += 1) {
        removeList[remove].remove();
    }
};

const adFreeSlotRemove = once(
    (): Promise<void> => {
        if (!commercialFeatures.adFree) {
            return Promise.resolve();
        }

        const adSlotsToRemove: Array<Element> = qwery(dfpEnv.adSlotSelector);

        const mpusToRemove: Array<Element> = qwery(mpuCandidateSelector).filter(
            shouldRemoveMpuWhenAdFree
        );

        const commercialFaciaContainersToRemove: Array<Element> = qwery(
            '.fc-container'
        ).filter(shouldRemoveFaciaContainerWhenAdFree);

        const paidForItemsToObscure: Array<Element> = qwery(
            '.fc-item--paid-content'
        );

        return fastdom.write(() => {
            adSlotsToRemove.forEach((adSlot: Element) => adSlot.remove());
            mpusToRemove.forEach((mpu: Element) =>
                mpu.classList.add('fc-slice__item--no-mpu')
            );
            commercialFaciaContainersToRemove.forEach(
                (faciaContainer: Element) => faciaContainer.classList.add('u-h')
            );
            paidForItemsToObscure.forEach((paidItem: Element) =>
                obscurePaidForContent(paidItem)
            );
        });
    }
);

export { adFreeSlotRemove };
