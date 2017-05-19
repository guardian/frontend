import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import addSlot from 'commercial/modules/dfp/add-slot';
import commercialFeatures from 'commercial/modules/commercial-features';
import createSlot from 'commercial/modules/dfp/create-slot';
export default function() {
    var $adSlotContainer = $('.js-discussion__ad-slot');

    if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
        return false;
    }

    mediator.once('modules:comments:renderComments:rendered', function() {
        var $commentMainColumn = $('.js-comments .content__main-column');

        fastdom.read(function() {
                return $commentMainColumn.dim().height;
            })
            .then(function(mainColHeight) {
                //if comments container is lower than 280px
                if (mainColHeight < 280) {
                    return;
                }

                var adSlot = createSlot('comments', {
                    classes: 'mpu-banner-ad'
                });

                fastdom.write(function() {
                        $commentMainColumn.addClass('discussion__ad-wrapper');

                        if (!config.page.isLiveBlog && !config.page.isMinuteArticle) {
                            $commentMainColumn.addClass('discussion__ad-wrapper-wider');
                        }

                        $adSlotContainer.append(adSlot);
                        return adSlot;
                    })
                    .then(addSlot.addSlot);
            });
    });
};
