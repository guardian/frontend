define([
    'common/utils/$'
], function (
    $
) {
    return function () {
        this.id = 'OnwardNames';
        this.start = '2015-10-20';
        this.expiry = '2015-11-20';
        this.author = 'John Duffell';
        this.description = 'renames the related content container';
        this.audience = 0.025;
        this.audienceOffset = 0.4;
        this.successMeasure = 'The number of onward journeys';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';//TODO
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
                id: 'You might like ...',
                test: function () {}
            },
            {
                id: 'Related stories',
                test: function () {}
            },
            {
                id: 'More like this',
                test: function () {}
            },
            {
                id: 'Connected stories',
                test: function () {}
            },
            {
                id: 'Explore further',
                test: function () {}
            },
            {
                id: 'Read further',
                test: function () {}
            },
            {
                id: 'Join the dots',
                test: function () {}
            }
        ];
    };
});
