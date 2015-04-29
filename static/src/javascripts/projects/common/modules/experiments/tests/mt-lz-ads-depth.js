define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config'
], function (
    fastdom,
    $,
    _,
    config
) {
    return function () {
        this.id = 'MtLzAdsDepth';
        this.start = '2015-04-15';
        this.expiry = '2015-05-15';
        this.author = 'Steve Vadocz';
        this.description = 'Testing multiple depths of lazy loaded ads on 1% of the US audience';
        this.audience = 0.01;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return config.page.edition === 'US';
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
            },
            {
                id: 'C',
                test: function () { }
            },
            {
                id: 'D',
                test: function () { }
            },
            {
                id: 'E',
                test: function () { }
            }
        ];
    };

});
