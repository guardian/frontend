define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/navigation/sticky-nav'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator,
    stickyNav
) {
    return function () {
        this.id = 'MtRec1';
        this.start = '2015-05-12';
        this.expiry = '2015-06-30';
        this.author = 'Zofia Korcz';
        this.description = 'Viewability results - Recommendation option 1';
        this.audience = 0.02;
        this.audienceOffset = 0.55;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US and UK edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            var isIE = detect.getUserAgent.browser === 'MSIE' || detect.getUserAgent === 'IE 11';

            return !isIE && _.contains(['UK', 'US'], config.page.edition);
        };

        this.fireRecTest = function () {
            stickyNav.stickySlow.init();
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'A',
                test: function () { }
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };

});
