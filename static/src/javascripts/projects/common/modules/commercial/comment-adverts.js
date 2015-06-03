define([
    'fastdom',
    'Promise',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/modules/experiments/ab',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/user-ad-targeting'
], function (
    fastdom,
    Promise,
    _,
    $,
    config,
    ab,
    createAdSlot,
    userAdTargeting
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
            isMtRecTest = function () {
                var MtRec1Test = ab.getParticipations().MtRec1,
                    MtRec2Test = ab.getParticipations().MtRec2;

                return ab.testCanBeRun('MtRec1') && MtRec1Test && MtRec1Test.variant === 'A' ||
                    ab.testCanBeRun('MtRec2') && MtRec2Test && MtRec2Test.variant === 'A';
            };

    //    mediator.once('modules:comments:renderComments:rendered', function () {
            $adSlotContainer = $(opts.adSlotContainerSelector);
            $commentMainColumn = $(opts.commentMainColumn, '.js-comments');

            console.log($adSlotContainer.length);
            console.log($commentMainColumn, $commentMainColumn.dim().height);
            // is the switch off, or not in the AB test, or there is no adslot container, or comments are disabled, or not signed in TODO
            if (!config.switches.standardAdverts || !isMtRecTest() || !$adSlotContainer.length || !config.switches.discussion) {
                return false;
            }

            $commentMainColumn.addClass('discussion__mtrec-test');

            return new Promise(function (resolve) {
                fastdom.read(function () {
                    adType = 'comments';

                    fastdom.write(function () {
                        $adSlotContainer.append(createAdSlot(adType, 'mpu-banner-ad'));

                        resolve($adSlotContainer);
                    });
                });
            });
    //    });
    }

    return {
        init: init
    };
});
