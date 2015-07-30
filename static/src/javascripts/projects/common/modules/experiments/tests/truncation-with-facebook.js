define([
    'common/utils/detect'
], function (
    detect
) {
    function noop() {}

    return function () {
        this.id = 'TruncationWithFacebook';
        this.start = '2015-07-29';
        this.expiry = '2015-08-17';
        this.author = 'Stephan Fowler';
        this.description = 'Truncation, with facebook most-viewed container';
        this.audience = 0.25;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Page views per visit';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'More page views per visit';

        this.canRun = function () {
            return detect.socialContext() === 'facebook';
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
