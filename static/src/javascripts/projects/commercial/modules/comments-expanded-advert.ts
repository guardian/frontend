import { adSizes, createAdSlot } from '@guardian/commercial-core';
import { AD_LABEL_HEIGHT } from '@guardian/commercial-core/dist/cjs/constants';
import { log } from '@guardian/libs';
import fastdom from '../../../lib/fastdom-promise';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { addSlot } from './dfp/add-slot';

const tallestCommentAd = adSizes.mpu.height + AD_LABEL_HEIGHT;
const tallestCommentsExpandedAd = adSizes.halfPage.height + AD_LABEL_HEIGHT;

const insertAd = (): Promise<void> => {
	const anchor = document.querySelector('.commentsRightColumn');
	if (!anchor) return Promise.resolve();

	const slot = createAdSlot('comments-expanded', {
		name: 'comments-expanded',
		classes: 'comments-expanded',
	});

	const adSlotContainer = document.createElement('div');
	adSlotContainer.className = 'ad-slot-container';
	adSlotContainer.style.position = 'sticky';
	adSlotContainer.style.top = '1em';

	adSlotContainer.appendChild(slot);

	const stickyContainer = document.createElement('div');
	stickyContainer.style.flexGrow = '1';

	stickyContainer.appendChild(adSlotContainer);

	return fastdom
		.mutate(() => {
			anchor.appendChild(adSlotContainer);
		})
		.then(() => {
			addSlot(slot, false);
		});
};

export const initCommentsExpandedAdverts = (): Promise<void> => {
	document.addEventListener('comments-expanded', () => {
		log('commercial', 'comments expanded event received');

		if (!commercialFeatures.commentAdverts) {
			log(
				'commercial',
				'Adverts in comments are disabled in commercialFeatures',
			);
			return;
		}

		// Do not insert an ad if there is not enough space for one.
		// This will likely occur if there are only a few comments.
		// TODO Use Mutation Observer
		void fastdom.measure(() => {
			const rightColumn = document.querySelector('.commentsRightColumn');
			if (!rightColumn) return;

			const rightColumnHeight = (rightColumn as HTMLElement).offsetHeight;

			// Only insert a second advert into the right-hand rail if there is enough space.
			// There is enough space if the right-hand rail is larger than:
			// (the largest possible heights of both adverts) + (the gap between the two adverts)
			const minHeightToPlaceAd =
				tallestCommentAd +
				tallestCommentsExpandedAd +
				window.innerHeight;

			if (rightColumnHeight < minHeightToPlaceAd) {
				log(
					'commercial',
					'Not enough space to insert comments-expanded advert',
				);
				return;
			}

			void insertAd();
		});
	});

	return Promise.resolve();
};
