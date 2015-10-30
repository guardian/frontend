define([
], function (
) {
    return function () {
        this.id = 'InjectNetworkFrontTest';
        this.start = '2015-10-30';
        this.expiry = '2015-11-30';
        this.author = 'Josh Holder';
        this.description = 'Replace the most popular container with the network front on all content pages';
        this.audience = 0.2;
        this.audienceOffset = 0.225;
        this.successMeasure = 'CTR, page views per visit, tendency to return within a week, engagement time per session';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'inject-network-front-ab';
        this.idealOutcome = '';

        this.canRun = function () {
            return !guardian.config.page.isFront;
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
