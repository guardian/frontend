import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import once from 'lodash/once';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const mpuCandidateClass = 'fc-slice__item--mpu-candidate';
const mpuCandidateSelector = `.${mpuCandidateClass}`;

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
    () => {
        if (!commercialFeatures.adFree) {
            return Promise.resolve();
        }

        const bodyEl = document.body;

        const adSlotsToRemove = qwery(dfpEnv.adSlotSelector);

        const mpusToRemove = qwery(mpuCandidateSelector).filter(
            shouldRemoveMpuWhenAdFree
        );

        const commercialFaciaContainersToRemove = qwery(
            '.fc-container'
        ).filter(shouldRemoveFaciaContainerWhenAdFree);

        const commercialThrashers = qwery(
            '.commercial-thrasher'
        );

        return fastdom.mutate(() => {
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
            adSlotsToRemove.forEach((adSlot) => adSlot.remove());
            mpusToRemove.forEach((mpu) =>
                mpu.classList.add('fc-slice__item--no-mpu')
            );
            commercialFaciaContainersToRemove.forEach(
                (faciaContainer) => faciaContainer.classList.add('u-h')
            );
            commercialThrashers.forEach((thrasher) => {
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
