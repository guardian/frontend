import type { SizeKeys, SizeMapping } from '@guardian/commercial-core';
import { adSizes, createAdSize, createAdSlot } from '@guardian/commercial-core';
import config from '../../../lib/config';
import { getBreakpoint } from '../../../lib/detect';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { isUserLoggedIn } from '../../common/modules/identity/api';
import { addSlot } from './dfp/add-slot';
import type { Advert } from './dfp/Advert';
import { getAdvertById } from './dfp/get-advert-by-id';
import { refreshAdvert } from './dfp/load-advert';

const createCommentSlot = (canBeDmpu: boolean): HTMLElement => {
	const sizes: SizeMapping = canBeDmpu
		? { desktop: [adSizes.halfPage, adSizes.skyscraper] }
		: {};
	const adSlot = createAdSlot('comments', { sizes });

	adSlot.classList.add('js-sticky-mpu');
	return adSlot;
};

const insertCommentAd = (
	commentMainColumn: Element,
	adSlotContainer: Element,
	canBeDmpu: boolean,
): Promise<void | EventEmitter> => {
	const commentSlot = createCommentSlot(canBeDmpu);

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
			addSlot(adSlot, false);
			void Promise.resolve(mediator.emit('page:commercial:comments'));
		});
};

const containsDMPU = (ad: Advert): boolean =>
	!!ad.sizes.desktop?.some(
		(el) =>
			(el[0] === 300 && el[1] === 600) ||
			(el[0] === 160 && el[1] === 600),
	);

const maybeUpgradeSlot = (ad: Advert, adSlot: Element): Advert => {
	if (!containsDMPU(ad) && ad.sizes.desktop) {
		const extraSizes: SizeKeys[] = ['halfPage', 'skyscraper'];
		ad.sizes.desktop.push(
			// TODO: add getTuple method to commercial-core
			...extraSizes.map((size) => {
				const { width, height } = adSizes[size];
				const tuple = createAdSize(width, height);
				return tuple;
			}),
		);
		const sizeMapping = ad.sizes.desktop.map((size) =>
			!size.width && !size.width
				? 'fluid'
				: (size as googletag.SingleSize),
		);
		ad.slot.defineSizeMapping([[[0, 0], sizeMapping]]);
		void fastdom.mutate(() => {
			adSlot.setAttribute(
				'data-desktop',
				'1,1|2,2|300,250|300,274|fluid|300,600|160,600',
			);
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
		refreshAdvert(maybeUpgradeSlot(commentAdvert, adSlot));
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
	const isMobile = getBreakpoint() === 'mobile';
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
