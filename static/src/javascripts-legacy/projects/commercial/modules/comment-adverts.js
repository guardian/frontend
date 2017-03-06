define([
    'Promise',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/fastdom-promise',
    'common/modules/identity/api',
    'common/modules/experiments/ab',
    'commercial/modules/dfp/add-slot',
    'commercial/modules/commercial-features',
    'commercial/modules/dfp/create-slot',
    'lodash/objects/defaults'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    fastdom,
    identityApi,
    ab,
    addSlot,
    commercialFeatures,
    createSlot,
    defaults
) {
    return function (options) {
        var opts = defaults(
                options || {},
                {
                    adSlotContainerSelector: '.js-discussion__ad-slot',
                    commentMainColumn: '.content__main-column'
                }
            ),
            $adSlotContainer,
            $commentMainColumn;

        $adSlotContainer = $(opts.adSlotContainerSelector);
        $commentMainColumn = $(opts.commentMainColumn, '.js-comments');

        if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
            return false;
        }

        mediator.once('modules:comments:renderComments:rendered', function () {
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
                .then(addSlot);
            });
        });
    };
});
