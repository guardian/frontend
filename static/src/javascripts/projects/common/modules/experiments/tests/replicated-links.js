define([
], function (
) {
    return function () {
        this.id = 'ReplicatedLinks';
        this.start = '2015-10-30';
        this.expiry = '2015-11-20';
        this.author = 'John Duffell';
        this.description = 'replicates the in body links near the bottom of the articles for 1 week';
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
                id: 'variant',
                test: function () {}
            }
        ];
    };
});
