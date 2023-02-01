import { adSizes, createAdSlot } from '@guardian/commercial-core';
import { AD_LABEL_HEIGHT } from '@guardian/commercial-core/dist/cjs/constants';
import { log } from '@guardian/libs';
import fastdom from '../../../lib/fastdom-promise';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { addSlot } from './dfp/add-slot';

const tallestCommentAd = adSizes.mpu.height + AD_LABEL_HEIGHT;
const tallestCommentsExpandedAd = adSizes.halfPage.height + AD_LABEL_HEIGHT;

const insertAd = (anchor: HTMLElement): Promise<void> => {
	log('commercial', 'Inserting comments-expanded advert');
	const slot = createAdSlot('comments-expanded', {
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

const getRightColumn = async (): Promise<HTMLElement> => {
	return fastdom.measure(() => {
		const rightColumn: HTMLElement | null = document.querySelector(
			'.commentsRightColumn',
		);

		if (!rightColumn) throw new Error('Could not find right column.');

		return rightColumn;
	});
};

const isEnoughSpaceForAd = (rightColumnNode: HTMLElement): boolean => {
	// Only insert a second advert into the right-hand rail if there is enough space.
	// There is enough space if the right-hand rail is larger than:
	// (the largest possible heights of both adverts) + (the gap between the two adverts)
	const minHeightToPlaceAd =
		tallestCommentAd + tallestCommentsExpandedAd + window.innerHeight;

	return rightColumnNode.offsetHeight >= minHeightToPlaceAd;
};

const createResizeObserver = (rightColumnNode: HTMLElement) => {
	// When the comments load and are rendered, the height of the right column
	// will expand and there might be enough space to insert the ad.
	const resizeObserver = new ResizeObserver(() => {
		if (isEnoughSpaceForAd(rightColumnNode)) {
			void insertAd(rightColumnNode);

			resizeObserver.unobserve(rightColumnNode);
		}
	});

	resizeObserver.observe(rightColumnNode);
};

/**
 * Create a comments-expanded ad immediately if there is enough space for it. If not, then it
 * is possible that we are still waiting for the Discussion API to load the comments, so we
 * wait for the comments to load before checking again whether there is enough space to load an ad.
 */
const handleCommentsExpandedEvent = async (): Promise<void> => {
	if (!commercialFeatures.commentAdverts) {
		log(
			'commercial',
			'Adverts in comments are disabled in commercialFeatures',
		);
		return;
	}

	const rightColumnNode = await getRightColumn();

	if (isEnoughSpaceForAd(rightColumnNode)) {
		void insertAd(rightColumnNode);
		return;
	}

	// Watch the right column and try to insert an ad when the comments are loaded.
	createResizeObserver(rightColumnNode);
};

export const initCommentsExpandedAdverts = (): Promise<void> => {
	document.addEventListener('comments-expanded', () => {
		void handleCommentsExpandedEvent();
	});

	return Promise.resolve();
};
