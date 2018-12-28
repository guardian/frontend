// @flow strict
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { adSizes } from 'commercial/modules/ad-sizes';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { refreshAdvert } from 'commercial/modules/dfp/load-advert';

import type { Advert } from 'commercial/modules/dfp/Advert';
import type bonzo from 'bonzo';

const createCommentSlots = (
    canBeDmpu: boolean
): Array<HTMLDivElement | HTMLSpanElement> => {
    const sizes = canBeDmpu ? { desktop: [adSizes.halfPage] } : {};
    const adSlots = createSlots('comments', { sizes });

    adSlots.forEach(adSlot => {
        adSlot.classList.add('js-sticky-mpu');
    });
    return adSlots;
};

const insertCommentAd = (
    $commentMainColumn: bonzo,
    $adSlotContainer: bonzo,
    canBeDmpu: boolean
): Promise<void> => {
    const commentSlots = createCommentSlots(canBeDmpu);

    return (
        fastdom
            .write(() => {
                $commentMainColumn.addClass('discussion__ad-wrapper');
                if (
                    !config.get('page.isLiveBlog') &&
                    !config.get('page.isMinuteArticle')
                ) {
                    $commentMainColumn.addClass('discussion__ad-wrapper-wider');
                }
                // Append each slot into the adslot container...
                commentSlots.forEach(adSlot => {
                    $adSlotContainer.append(adSlot);
                });
                return commentSlots[0];
            })
            // Add only the fist slot (DFP slot) to GTP
            .then((adSlot: HTMLElement) => {
                addSlot(adSlot, false);
                Promise.resolve(mediator.emit('page:commercial:comments'));
            })
    );
};

const containsDMPU = (ad: Advert): boolean =>
    ad.sizes.desktop.some(el => el[0] === 300 && el[1] === 600);

const maybeUpgradeSlot = (ad: Advert, $adSlot: bonzo): Advert => {
    if (!containsDMPU(ad)) {
        ad.sizes.desktop.push([300, 600]);
        ad.slot.defineSizeMapping([[[0, 0], ad.sizes.desktop]]);
        fastdom.write(() => {
            $adSlot[0].setAttribute(
                'data-desktop',
                '1,1|2,2|300,250|300,274|fluid|300,600'
            );
        });
    }
    return ad;
};

const refreshCommentAd = ($adSlotContainer: bonzo): void => {
    const $adSlot: bonzo = $('.js-ad-slot', $adSlotContainer);
    const commentAdvert = getAdvertById('dfp-ad--comments');

    if (commentAdvert && $adSlot.length) {
        refreshAdvert(maybeUpgradeSlot(commentAdvert, $adSlot));
    }
};

export const initCommentAdverts = (): Promise<boolean> => {
    const $adSlotContainer: bonzo = $('.js-discussion__ad-slot');

    if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
        return Promise.resolve(false);
    }

    mediator.once(
        'modules:comments:renderComments:rendered',
        (): void => {
            const isLoggedIn: boolean = isUserLoggedIn();
            const $commentMainColumn: bonzo = $(
                '.js-comments .content__main-column'
            );

            fastdom
                .read(() => $commentMainColumn.dim().height)
                .then((mainColHeight: number) => {
                    // always insert an MPU/DMPU if the user is logged in, since the
                    // containers are reordered, and comments are further from most-pop
                    if (
                        mainColHeight >= 800 ||
                        (isLoggedIn && mainColHeight >= 600)
                    ) {
                        return insertCommentAd(
                            $commentMainColumn,
                            $adSlotContainer,
                            true
                        );
                    }
                    // this is the tricky one since we need to upgrade it to a DMPU asap
                    if (isLoggedIn) {
                        return insertCommentAd(
                            $commentMainColumn,
                            $adSlotContainer,
                            false
                        );
                    }
                    mediator.once(
                        'discussion:comments:get-more-replies',
                        () => {
                            insertCommentAd(
                                $commentMainColumn,
                                $adSlotContainer,
                                true
                            );
                        }
                    );
                    return Promise.resolve();
                })
                .then(() => {
                    mediator.on('discussion:comments:get-more-replies', () => {
                        // when we refresh the slot, the sticky behavior runs again
                        // this means the sticky-scroll height is corrected!
                        refreshCommentAd($adSlotContainer);
                    });
                });
        }
    );
    return Promise.resolve(true);
};

export const _ = {
    maybeUpgradeSlot,
    createCommentSlots,
    insertCommentAd,
    refreshCommentAd,
    containsDMPU,
};
