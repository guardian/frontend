define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/fastdom-idle',
    'common/modules/identity/api',
    'common/modules/experiments/ab',
    'common/modules/commercial/dfp/dfp-api',
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
    dfp,
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

        if (!config.switches.standardAdverts ||
            !config.switches.viewability ||
            !$adSlotContainer.length ||
            !config.switches.discussion ||
            !identityApi.isUserLoggedIn() ||
            (config.page.section === 'childrens-books-site' || config.page.shouldHideAdverts) || /* Sensitive pages */
            (config.page.isLiveBlog && detect.getBreakpoint() !== 'wide') ||
            !config.page.commentable ||
            config.page.isMinuteArticle) {
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
                    dfp.addSlot($adSlot);
                });
            });
        });
    };
});
