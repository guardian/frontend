// @flow
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import commercialFeatures from 'commercial/modules/commercial-features';
import createSlot from 'commercial/modules/dfp/create-slot';
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

                const adSlot: HTMLDivElement = createSlot('comments', {
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

                        $adSlotContainer.append(adSlot);
                        return adSlot;
                    })
                    .then((htmlElement: HTMLElement) =>
                        addSlot(htmlElement, false)
                    );
            });
    });
};

export default init;
