define([
    'Promise',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/fastdom-idle',
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
    idleFastdom,
    identityApi,
    ab,
    addSlot,
    commercialFeatures,
    createSlot,
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

                    $adSlot = $(createSlot(adType, 'mpu-banner-ad'));
                    $adSlotContainer.append($adSlot);
                    addSlot($adSlot);
                });
            });
        });
    };
});
