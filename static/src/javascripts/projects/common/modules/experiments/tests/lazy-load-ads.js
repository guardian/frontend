define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'LzAds';
        this.start = '2015-03-12';
        this.expiry = '2015-04-26';
        this.author = 'Steve Vadocz';
        this.description = 'Lazy loading ads';
        this.audience = 0.01;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US and UK edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'UK' || config.page.edition === 'US';
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'A',
                test: function () { }
            }
        ];
    };

});
