define([
    'Promise',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/fastdom-promise',
    'commercial/modules/dfp/add-slot',
    'commercial/modules/commercial-features',
    'commercial/modules/dfp/create-slot'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    fastdom,
    addSlot,
    commercialFeatures,
    createSlot
) {
    return function () {
        var $adSlotContainer = $('.js-discussion__ad-slot');

        if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
            return false;
        }

        mediator.once('modules:comments:renderComments:rendered', function () {
            var $commentMainColumn = $('.js-comments .content__main-column');

            fastdom.read(function () {
                return $commentMainColumn.dim().height;
            })
            .then(function (mainColHeight) {
                //if comments container is lower than 280px
                if (mainColHeight < 280) {
                    return;
                }

                var adSlot = createSlot('comments', { classes: 'mpu-banner-ad' });

                fastdom.write(function () {
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
});
