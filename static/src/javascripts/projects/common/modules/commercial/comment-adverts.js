define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/fastdom-idle',
    'common/modules/identity/api',
    'common/modules/experiments/ab',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/create-ad-slot',
    'lodash/objects/defaults'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    idleFastdom,
    identityApi,
    ab,
    addSlot,
    commercialFeatures,
    createAdSlot,
    defaults
) {
    return function (options) {
        var adType,
            opts = defaults(
                options || {},
                {
                    adSlotContainerSelector: '.js-discussion__ad-slot',
                    commentMainColumn: '.content__main-column'
                }
            ),
            $adSlotContainer,
            $commentMainColumn,
            $adSlot;

        $adSlotContainer = $(opts.adSlotContainerSelector);
        $commentMainColumn = $(opts.commentMainColumn, '.js-comments');

        if (!commercialFeatures.commentAdverts || !$adSlotContainer.length) {
            return false;
        }

        mediator.once('modules:comments:renderComments:rendered', function () {
            idleFastdom.read(function () {
                //if comments container is lower than 280px
                if ($commentMainColumn.dim().height < 280) {
                    return false;
                }

                idleFastdom.write(function () {
                    $commentMainColumn.addClass('discussion__ad-wrapper');

                    if (!config.page.isLiveBlog && !config.page.isMinuteArticle) {
                        $commentMainColumn.addClass('discussion__ad-wrapper-wider');
                    }

                    adType = 'comments';

                    $adSlot = $(createAdSlot(adType, 'mpu-banner-ad'));
                    $adSlotContainer.append($adSlot);
                    addSlot($adSlot);
                });
            });
        });
    };
});
