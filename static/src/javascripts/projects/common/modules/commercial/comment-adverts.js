define([
    'fastdom',
    'Promise',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/modules/identity/api',
    'common/modules/experiments/ab',
    'common/modules/commercial/create-ad-slot'
], function (
    fastdom,
    Promise,
    _,
    $,
    config,
    identityApi,
    ab,
    createAdSlot
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
            isViewabilityTest = function () {
                var MtRec1Test = ab.getParticipations().MtRec1,
                    MtRec2Test = ab.getParticipations().MtRec2,
                    ViewabilityTest = ab.getParticipations().Viewability;

                return ab.testCanBeRun('MtRec1') && MtRec1Test && MtRec1Test.variant === 'A' ||
                    ab.testCanBeRun('MtRec2') && MtRec2Test && MtRec2Test.variant === 'A' ||
                    ab.testCanBeRun('Viewability') && ViewabilityTest && ViewabilityTest.variant === 'variant';
            };

        $adSlotContainer = $(opts.adSlotContainerSelector);
        $commentMainColumn = $(opts.commentMainColumn, '.js-comments');

        // is the switch off, or not in the AB test, or there is no adslot container, or comments are disabled, or not signed in
        if (!config.switches.standardAdverts || !isViewabilityTest() || !$adSlotContainer.length || !config.switches.discussion || !identityApi.isUserLoggedIn()) {
            return false;
        }

        $commentMainColumn.addClass('discussion__ad-wrapper');

        return new Promise(function (resolve) {
            fastdom.read(function () {
                adType = 'comments';

                fastdom.write(function () {
                    $adSlotContainer.append(createAdSlot(adType, 'mpu-banner-ad'));

                    resolve($adSlotContainer);
                });
            });
        });
    }

    return {
        init: init
    };
});
