define([
    'common/utils/detect'
], function (
    detect
) {
    function noop() {}

    return function () {
        this.id = 'ArticleTruncation';
        this.start = '2015-06-22';
        this.expiry = '2015-08-01';
        this.author = 'Robert Berry';
        this.description = 'Article truncation when in social context';
        this.audience = 0.1;
        this.audienceOffset = 0.75;
        this.successMeasure = 'More page views per visit';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return !!detect.socialContext();
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
