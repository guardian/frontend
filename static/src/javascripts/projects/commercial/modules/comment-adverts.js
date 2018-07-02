// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import type bonzo from 'bonzo';
import { isUserLoggedIn } from 'common/modules/identity/api';

export const initCommentAdverts = (): ?boolean => {
    const $adSlotContainer: bonzo = $('.js-discussion__ad-slot');

    const insertCommentAd = ($commentMainColumn: bonzo): void => {
        const adSlots = createSlots('comments', {
            classes: 'mpu-banner-ad',
        });
        adSlots.forEach(adSlot => {
            adSlot.classList.add('js-sticky-mpu');
        });
        fastdom
            .write(() => {
                $commentMainColumn.addClass('discussion__ad-wrapper');

                if (!config.page.isLiveBlog && !config.page.isMinuteArticle) {
                    $commentMainColumn.addClass('discussion__ad-wrapper-wider');
                }

                adSlots.forEach(adSlot => {
                    $adSlotContainer.append(adSlot);
                });
                return adSlots[0];
            })
            // Add only the fist slot (DFP slot) to GTP
            .then((adSlot: HTMLElement) => addSlot(adSlot, false));
    };

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
                    if (
                        mainColHeight >= 800 ||
                        (isUserLoggedIn() && mainColHeight >= 300)
                    ) {
                        insertCommentAd($commentMainColumn);
                    } else {
                        mediator.once(
                            'discussion:comments:get-more-replies',
                            () => {
                                insertCommentAd($commentMainColumn);
                            }
                        );
                    }
                });
        }
    );
};
