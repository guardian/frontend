define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator
) {
    return function () {
        this.id = 'LzAds';
        this.start = '2015-04-15';
        this.expiry = '2015-05-15';
        this.author = 'Steve Vadocz';
        this.description = 'Testing lazy loaded ads on 1% of the US audience';
        this.audience = 0.02;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US';
        this.dataLinkNames = '';
        this.idealOutcome = '';

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
            }
        ];
    };

});
