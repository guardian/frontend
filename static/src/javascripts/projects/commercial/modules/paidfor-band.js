import { Sticky } from '../../common/modules/ui/sticky';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';

/**
 * Inistialise Guardian Labs 'Paid content' header
 * e.g. https://www.theguardian.com/100-teachers/2021/jan/28/a-day-in-the-life-of-one-of-the-uks-youngest-headteachers
 * @returns Promise
 */
export const init = () => {
	if (!commercialFeatures.paidforBand) {
		return Promise.resolve(false);
	}

	const elem = document.querySelector('.paidfor-band');
	if (elem) {
		new Sticky(elem).init();
	}

	return Promise.resolve(true);
};
