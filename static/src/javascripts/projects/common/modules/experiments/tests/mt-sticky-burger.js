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
        this.id = 'MtStickyBurger';
        this.start = '2015-04-21';
        this.expiry = '2015-05-21';
        this.author = 'Zofia Korcz';
        this.description = 'Sticky top banner with navigation - variant 1. with the burger icon';
        this.audience = 0.02;
        this.audienceOffset = 0.03;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            var isIE = detect.getUserAgent.browser === 'MSIE' || detect.getUserAgent === 'IE 11',
                isUS = config.page.edition === 'US';

            return !isIE && isUS;
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'A',
                test: function () { 
                    stickyNav.stickyNavBurger();
                }
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };

});
