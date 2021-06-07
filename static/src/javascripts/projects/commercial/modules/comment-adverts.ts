import config_ from '../../../lib/config';
import { getBreakpoint } from '../../../lib/detect';
import fastdom from '../../../lib/fastdom-promise';
import mediator from '../../../lib/mediator';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { isUserLoggedIn } from '../../common/modules/identity/api';
import { adSizes } from './ad-sizes';
import { addSlot } from './dfp/add-slot';
import type { Advert } from './dfp/Advert';
import { createSlots } from './dfp/create-slots';
import { getAdvertById } from './dfp/get-advert-by-id';
import { refreshAdvert } from './dfp/load-advert';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d?: string) => string;
};

const createCommentSlots = (canBeDmpu: boolean): Element[] => {
	const sizes = canBeDmpu
		? { desktop: [adSizes.halfPage, adSizes.skyscraper] }
		: {};
	const adSlots = createSlots('comments', { sizes });

	adSlots.forEach((adSlot) => {
		adSlot.classList.add('js-sticky-mpu');
	});
	return adSlots;
};

const insertCommentAd = (
	commentMainColumn: Element,
	adSlotContainer: Element,
	canBeDmpu: boolean,
): Promise<void | EventEmitter> => {
	const commentSlots = createCommentSlots(canBeDmpu);

	return (
		fastdom
			.mutate(() => {
				commentMainColumn.classList.add('discussion__ad-wrapper');
				if (
					!config.get('page.isLiveBlog') &&
					!config.get('page.isMinuteArticle')
				) {
					commentMainColumn.classList.add(
						'discussion__ad-wrapper-wider',
					);
				}
				// Append each slot into the adslot container...
				commentSlots.forEach((adSlot) => {
					adSlotContainer.appendChild(adSlot);
				});
				return commentSlots[0];
			})
			// Add only the fist slot (DFP slot) to GTP
			.then((adSlot) => {
				addSlot(adSlot, false);
				void Promise.resolve(mediator.emit('page:commercial:comments'));
			})
	);
};

const containsDMPU = (ad: Advert): boolean =>
	ad.sizes.desktop.some(
		(el) =>
			(el[0] === 300 && el[1] === 600) ||
			(el[0] === 160 && el[1] === 600),
	);

const maybeUpgradeSlot = (ad: Advert, adSlot: Element): Advert => {
	if (!containsDMPU(ad)) {
		ad.sizes.desktop.push([300, 600], [160, 600]);
		const defineSizeMappingFunction = ad.slot.defineSizeMapping as (
			asm: SizeMapping[],
		) => Slot;
		defineSizeMappingFunction([[[0, 0], ad.sizes.desktop]]);
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

export const initCommentAdverts = (): Promise<boolean> => {
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
	createCommentSlots,
	insertCommentAd,
	runSecondStage,
	containsDMPU,
};
