// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import type bonzo from 'bonzo';

const init = (): ?boolean => {
    const $adSlotContainer: bonzo = $('.js-discussion__ad-slot');

    if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
        return false;
    }

    mediator.once('modules:comments:renderComments:rendered', (): void => {
        const $commentMainColumn: bonzo = $(
            '.js-comments .content__main-column'
        );

        fastdom
            .read(() => $commentMainColumn.dim().height)
            .then((mainColHeight: number) => {
                // if comments container is lower than 280px
                if (mainColHeight < 280) {
                    return;
                }

                const adSlots = createSlots('comments', {
                    classes: 'mpu-banner-ad',
                });

                fastdom
                    .write(() => {
                        $commentMainColumn.addClass('discussion__ad-wrapper');

                        if (
                            !config.page.isLiveBlog &&
                            !config.page.isMinuteArticle
                        ) {
                            $commentMainColumn.addClass(
                                'discussion__ad-wrapper-wider'
                            );
                        }

                        adSlots.forEach(adSlot => {
                            $adSlotContainer.append(adSlot);
                        });
                        return adSlots[0];
                    })
                    // Add only the fist slot (DFP slot) to GTP
                    .then((adSlot: HTMLElement) => addSlot(adSlot, false));
            });
    });
};

export default init;
