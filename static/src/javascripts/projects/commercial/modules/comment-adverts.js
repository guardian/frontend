// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { adSizes } from 'commercial/modules/ad-sizes';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import type bonzo from 'bonzo';

const createCommentSlot = (canBeDmpu: boolean): HTMLElement => {
    const sizes = canBeDmpu ? { desktop: [adSizes.halfPage] } : {};
    const adSlots = createSlots('comments', { sizes });

    adSlots.forEach(adSlot => {
        adSlot.classList.add('js-sticky-mpu');
    });
    return adSlots[0];
};

const insertCommentAd = (
    $commentMainColumn: bonzo,
    $adSlotContainer: bonzo,
    canBeDmpu: boolean
): void => {
    const commentSlot: HTMLElement = createCommentSlot(canBeDmpu);

    fastdom
        .write(() => {
            $commentMainColumn.addClass('discussion__ad-wrapper');
            if (
                !config.get('page.isLiveBlog') &&
                !config.get('page.isMinuteArticle')
            ) {
                $commentMainColumn.addClass('discussion__ad-wrapper-wider');
            }
            $adSlotContainer.append(commentSlot);
            return commentSlot;
        })
        // Add only the fist slot (DFP slot) to GTP
        .then((adSlot: HTMLElement) => {
            addSlot(adSlot, false);
            mediator.emit('page:defaultcommercial:comments');
        });
};

export const initCommentAdverts = (): ?boolean => {
    const $adSlotContainer: bonzo = $('.js-discussion__ad-slot');

    if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
        return false;
    }

    mediator.once(
        'modules:comments:renderComments:rendered',
        (): void => {
            const $commentMainColumn: bonzo = $(
                '.js-comments .content__main-column'
            );

            fastdom
                .read(() => $commentMainColumn.dim().height)
                .then((mainColHeight: number) => {
                    const isLoggedIn: boolean = isUserLoggedIn();
                    if (
                        mainColHeight >= 800 ||
                        (isLoggedIn && mainColHeight >= 600)
                    ) {
                        insertCommentAd(
                            $commentMainColumn,
                            $adSlotContainer,
                            true
                        );
                    } else if (isLoggedIn) {
                        insertCommentAd(
                            $commentMainColumn,
                            $adSlotContainer,
                            false
                        );
                    } else {
                        mediator.on(
                            'discussion:comments:get-more-replies',
                            () => {
                                insertCommentAd(
                                    $commentMainColumn,
                                    $adSlotContainer,
                                    true
                                );
                            }
                        );
                    }
                });
        }
    );
};

export const _ = { createCommentSlot, insertCommentAd };
