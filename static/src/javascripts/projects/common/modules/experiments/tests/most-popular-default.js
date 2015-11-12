define([
], function (
) {
    return function () {
        this.id = 'MostPopularDefaultTest';
        this.start = '2015-11-12';
        this.expiry = '2015-11-17';
        this.author = 'Natalia Baltazar';
        this.description = 'Change the default of most popular container to show `across the guardian` first instead of the section';
        this.audience = 0.04;
        this.audienceOffset = 0.02;
        this.successMeasure = 'CTR, page views per visit, tendency to return within a week, engagement time per session';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'most-popular-default-ab';
        this.idealOutcome = '';

        this.canRun = function () {
            return !window.guardian.config.page.isFront;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'variant',
                test: function () {

                }
            }
        ];
    };
});
