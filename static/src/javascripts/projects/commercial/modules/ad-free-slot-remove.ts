import { once } from 'lodash-es';
import { getEnhancedConsent } from 'common/modules/commercial/enhanced-consent';
import { $$ } from '../../../lib/$$';
import fastdom from '../../../lib/fastdom-promise';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { dfpEnv } from './dfp/dfp-env';

const mpuCandidateClass = 'fc-slice__item--mpu-candidate';
const mpuCandidateSelector = `.${mpuCandidateClass}`;

const shouldRemoveMpuWhenAdFree = (mpuCandidate: HTMLElement) =>
	mpuCandidate.className.toLowerCase().includes(mpuCandidateClass);

const shouldRemoveFaciaContainerWhenAdFree = (faciaContainer: HTMLElement) => {
	const dataComponentAttribute =
		faciaContainer.getAttribute('data-component');
	return dataComponentAttribute?.includes('commercial-container');
};

/**
 * If the user is ad-free, remove all ad slots on the page
 */
const adFreeSlotRemove = once(async () => {
	const consent = await getEnhancedConsent();
	if (!commercialFeatures.adFree && consent.canTarget) {
		return;
	}

	const bodyEl = document.body;

	const $adSlotsToRemove = $$(dfpEnv.adSlotSelector);

	const mpusToRemove = $$(mpuCandidateSelector)
		.get()
		.filter(shouldRemoveMpuWhenAdFree);

	const commercialFaciaContainersToRemove = $$('.fc-container')
		.get()
		.filter(shouldRemoveFaciaContainerWhenAdFree);

	const commercialThrashers = $$('.commercial-thrasher');

	return fastdom.mutate(() => {
		if (bodyEl.classList.toString().includes('has-page-skin')) {
			bodyEl.classList.remove('has-page-skin');
		}
		if (bodyEl.classList.toString().includes('has-active-pageskin')) {
			bodyEl.classList.remove('has-active-pageskin');
		}

		$$('.top-banner-ad-container').remove();
		$adSlotsToRemove.remove();

		mpusToRemove.forEach((mpu: HTMLElement) =>
			mpu.classList.add('fc-slice__item--no-mpu'),
		);

		commercialFaciaContainersToRemove.forEach((faciaContainer) =>
			faciaContainer.classList.add('u-h'),
		);
		commercialThrashers.get().forEach((thrasher) => {
			const closestFaciaContainer = thrasher.closest(
				'.fc-container--thrasher',
			);
			if (closestFaciaContainer) {
				closestFaciaContainer.remove();
			}
		});
	});
});

export { adFreeSlotRemove };
