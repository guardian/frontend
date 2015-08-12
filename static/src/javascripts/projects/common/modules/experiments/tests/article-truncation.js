define([], function () {
    function noop() {}

    return function () {
        this.id = 'ArticleTruncation';
        this.start = '2015-07-20';
        this.expiry = '2015-07-30';
        this.author = 'Stephan Fowler';
        this.description = 'Article truncation of Film content, when visit is a non-guardian referral';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Page views per visit';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'More page views per visit';

        this.canRun = function () {
            return true;
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
