define([], function () {
    function noop() {}

    return function () {
        this.id = 'ArticleTruncation';
        this.start = '2015-07-20';
        this.expiry = '2015-07-30';
        this.author = 'Stephan Fowler';
        this.description = 'Article truncation when in social context';
        this.audience = 0.1;
        this.audienceOffset = 0.15;
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
