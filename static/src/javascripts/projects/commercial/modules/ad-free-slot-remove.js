// @flow
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/once';
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

const adFreeSlotRemove = once(
    (): Promise<void> => {
        if (!commercialFeatures.adFree) {
            return Promise.resolve();
        }

        const bodyEl = document.body;

        const adSlotsToRemove: Array<Element> = qwery(dfpEnv.adSlotSelector);

        const mpusToRemove: Array<Element> = qwery(mpuCandidateSelector).filter(
            shouldRemoveMpuWhenAdFree
        );

        const commercialFaciaContainersToRemove: Array<Element> = qwery(
            '.fc-container'
        ).filter(shouldRemoveFaciaContainerWhenAdFree);

        const commercialThrashers: Array<Element> = qwery(
            '.commercial-thrasher'
        );

        return fastdom.write(() => {
            if (bodyEl) {
                if (bodyEl.classList.toString().includes('has-page-skin')) {
                    bodyEl.classList.remove('has-page-skin');
                }
                if (
                    bodyEl.classList.toString().includes('has-active-pageskin')
                ) {
                    bodyEl.classList.remove('has-active-pageskin');
                }
            }
            adSlotsToRemove.forEach((adSlot: Element) => adSlot.remove());
            mpusToRemove.forEach((mpu: Element) =>
                mpu.classList.add('fc-slice__item--no-mpu')
            );
            commercialFaciaContainersToRemove.forEach(
                (faciaContainer: Element) => faciaContainer.classList.add('u-h')
            );
            commercialThrashers.forEach((thrasher: Element) => {
                const closestFaciaContainer = thrasher.closest(
                    '.fc-container--thrasher'
                );
                if (closestFaciaContainer) {
                    closestFaciaContainer.remove();
                }
            });
        });
    }
);

export { adFreeSlotRemove };
