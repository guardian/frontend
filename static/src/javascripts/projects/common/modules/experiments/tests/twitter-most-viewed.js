define([
    'qwery',
    'common/utils/config',
    'common/utils/detect'
], function (
    qwery,
    config,
    detect
) {
    function noop() {}

    return function () {
        this.id = 'TwitterMostViewed';
        this.start = '2015-06-12';
        this.expiry = '2015-08-01';
        this.author = 'Robert Berry';
        this.description = 'Twitter most viewed container';
        this.audience = 0.1;
        this.audienceOffset = 0.35;
        this.successMeasure = 'More page views per visit';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return detect.socialContext() === 'twitter';
        };

        this.variants = [
            {
                id: 'control',
                test: noop
            },
            {
                id: 'variant',
                test: noop
            }
        ];
    };
});
