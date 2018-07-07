// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import type bonzo from 'bonzo';

const insertCommentAd = (
    $commentMainColumn: bonzo,
    $adSlotContainer: bonzo
): void => {
    const adSlots = createSlots('comments', {
        classes: 'mpu-banner-ad',
    });
    adSlots.forEach(adSlot => {
        adSlot.classList.add('js-sticky-mpu');
    });
    fastdom
        .write(() => {
            $commentMainColumn.addClass('discussion__ad-wrapper');

            if (
                !config.get('page.isLiveBlog') &&
                !config.get('page.isMinuteArticle')
            ) {
                $commentMainColumn.addClass('discussion__ad-wrapper-wider');
            }

            adSlots.forEach(adSlot => {
                $adSlotContainer.append(adSlot);
            });
            return adSlots[0];
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
                    if (mainColHeight >= 800) {
                        insertCommentAd($commentMainColumn, $adSlotContainer);
                    } else {
                        mediator.once(
                            'discussion:comments:get-more-replies',
                            () => {
                                insertCommentAd(
                                    $commentMainColumn,
                                    $adSlotContainer
                                );
                            }
                        );
                    }
                });
        }
    );
};
