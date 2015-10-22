define([
], function (
) {
    return function () {
        this.id = 'OnwardNames';
        this.start = '2015-10-22';
        this.expiry = '2015-11-20';
        this.author = 'John Duffell';
        this.description = 'renames the related content container for 2 weeks';
        this.audience = 0.4;
        this.audienceOffset = 0.6;
        this.successMeasure = 'The number of onward journeys';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'the clicks should be significantly higher for one of the buckets';

        this.canRun = function () {
            return window.guardian.config.page.contentType === 'Article';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'test:You might like...',
                test: function () {}
            },
            {
                id: 'test:Suggested articles',
                test: function () {}
            },
            {
                id: 'test:Keep reading',
                test: function () {}
            }
        ];
    };
});
