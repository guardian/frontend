define([
    'fastdom',
    'Promise',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/identity/api',
    'common/modules/experiments/ab',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/dfp'
], function (
    fastdom,
    Promise,
    _,
    $,
    config,
    detect,
    mediator,
    identityApi,
    ab,
    createAdSlot,
    dfp
) {
    function init(options) {
        var adType,
            opts = _.defaults(
                options || {},
                {
                    adSlotContainerSelector: '.js-discussion__ad-slot',
                    commentMainColumn: '.content__main-column'
                }
            ),
            $adSlotContainer,
            $commentMainColumn,
            $adSlot,
            isMtRecTest = function () {
                var MtRec1Test = ab.getParticipations().MtRec1,
                    MtRec2Test = ab.getParticipations().MtRec2;

                return ab.testCanBeRun('MtRec1') && MtRec1Test && MtRec1Test.variant === 'A' ||
                    ab.testCanBeRun('MtRec2') && MtRec2Test && MtRec2Test.variant === 'A';
            };

        $adSlotContainer = $(opts.adSlotContainerSelector);
        $commentMainColumn = $(opts.commentMainColumn, '.js-comments');

        if (!config.switches.standardAdverts ||
            !isMtRecTest() ||
            !$adSlotContainer.length ||
            !config.switches.discussion ||
            !identityApi.isUserLoggedIn() ||
            (config.page.isLiveBlog && detect.getBreakpoint() !== 'wide') ||
            !config.page.commentable) {
            return false;
        }

        mediator.once('modules:comments:renderComments:rendered', function () {
            fastdom.read(function () {
                //if comments container is lower than 280px
                if ($commentMainColumn.dim().height < 280) {
                    return false;
                }

                fastdom.write(function () {
                    $commentMainColumn.addClass('discussion__ad-wrapper');

                    if (!config.page.isLiveBlog) {
                        $commentMainColumn.addClass('discussion__ad-wrapper-wider');
                    }

                    adType = 'comments';

                    $adSlot = $(createAdSlot(adType, 'mpu-banner-ad'));
                    $adSlotContainer.append($adSlot);
                    dfp.addSlot($adSlot);
                });
            });
        });

    }

    return {
        init: init
    };
});
