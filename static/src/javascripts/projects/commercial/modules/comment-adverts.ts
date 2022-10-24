import { adSizes, createAdSlot } from '@guardian/commercial-core';
import { getCurrentBreakpoint } from 'lib/detect-breakpoint';
import config from '../../../lib/config';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { isUserLoggedIn } from '../../common/modules/identity/api';
import { addSlot } from './dfp/add-slot';
import type { Advert } from './dfp/Advert';
import { getAdvertById } from './dfp/get-advert-by-id';
import { refreshAdvert } from './dfp/load-advert';

const createCommentSlot = (): HTMLElement => {
	const adSlot = createAdSlot('comments');

	adSlot.classList.add('js-sticky-mpu');
	return adSlot;
};

const insertCommentAd = (
	commentMainColumn: Element,
	adSlotContainer: Element,
	canBeDmpu: boolean,
): Promise<void | EventEmitter> => {
	const commentSlot = createCommentSlot();

	return fastdom
		.mutate(() => {
			commentMainColumn.classList.add('discussion__ad-wrapper');
			if (
				!config.get<boolean>('page.isLiveBlog') &&
				!config.get<boolean>('page.isMinuteArticle')
			) {
				commentMainColumn.classList.add('discussion__ad-wrapper-wider');
			}
			adSlotContainer.appendChild(commentSlot);
			return commentSlot;
		})
		.then((adSlot) => {
			addSlot(
				adSlot,
				false,
				canBeDmpu
					? { desktop: [adSizes.halfPage, adSizes.skyscraper] }
					: {},
			);
			void Promise.resolve(mediator.emit('page:commercial:comments'));
		});
};

const containsDMPU = (ad: Advert): boolean =>
	!!ad.sizes.desktop?.some(
		(el) =>
			(el[0] === 300 && el[1] === 600) ||
			(el[0] === 160 && el[1] === 600),
	);

const maybeUpgradeSlot = (ad: Advert): Advert => {
	if (!containsDMPU(ad) && ad.sizes.desktop) {
		ad.updateSizeMapping({
			...ad.sizes,
			desktop: [
				...ad.sizes.desktop,
				adSizes.halfPage,
				adSizes.skyscraper,
			],
		});
	}
	return ad;
};

const runSecondStage = (
	commentMainColumn: Element,
	adSlotContainer: Element,
): void => {
	const adSlot = adSlotContainer.querySelector('.js-ad-slot');
	const commentAdvert = getAdvertById('dfp-ad--comments');

	if (commentAdvert && adSlot) {
		// when we refresh the slot, the sticky behavior runs again
		// this means the sticky-scroll height is corrected!
		refreshAdvert(maybeUpgradeSlot(commentAdvert));
	}

	if (!commentAdvert) {
		void insertCommentAd(commentMainColumn, adSlotContainer, true);
	}
};

/**
 * Initialize ad slot for comment section
 * @returns Promise
 */
export const initCommentAdverts = (): Promise<boolean> => {
	// TODO is this relevant? add amIUsed
	const adSlotContainer = document.querySelector('.js-discussion__ad-slot');
	const isMobile = getCurrentBreakpoint() === 'mobile';
	if (!commercialFeatures.commentAdverts || !adSlotContainer || isMobile) {
		return Promise.resolve(false);
	}

	mediator.once('modules:comments:renderComments:rendered', () => {
		const isLoggedIn = isUserLoggedIn();
		const commentMainColumn = document.querySelector<HTMLElement>(
			'.js-comments .content__main-column',
		);

		if (commentMainColumn) {
			void fastdom
				.measure(() => commentMainColumn.offsetHeight)
				.then((mainColHeight) => {
					// always insert an MPU/DMPU if the user is logged in, since the
					// containers are reordered, and comments are further from most-pop
					if (
						mainColHeight >= 800 ||
						(isLoggedIn && mainColHeight >= 600)
					) {
						void insertCommentAd(
							commentMainColumn,
							adSlotContainer,
							true,
						);
					} else if (isLoggedIn) {
						void insertCommentAd(
							commentMainColumn,
							adSlotContainer,
							false,
						);
					}
					mediator.on('discussion:comments:get-more-replies', () => {
						runSecondStage(commentMainColumn, adSlotContainer);
					});
				});
		}
	});
	return Promise.resolve(true);
};

export const _ = {
	maybeUpgradeSlot,
	createCommentSlot,
	insertCommentAd,
	runSecondStage,
	containsDMPU,
};
