define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'InjectNetworkFrontTest';
        this.start = '2015-10-30';
        this.expiry = '2015-11-30';
        this.author = 'Josh Holder';
        this.description = 'Replace the most popular container with the network front on all content pages';
        this.audience = 0.02;
        this.audienceOffset = 0;
        this.successMeasure = 'CTR, page views per visit, tendency to return within a week, engagement time per session';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'inject-network-front-ab';
        this.idealOutcome = '';

        this.canRun = function () {
            return !config.page.isFront &&
                   !(config.page.contentType === 'LiveBlog' || config.page.contentType === 'Interactive') &&
                   // following check rules out any iPhones older than an iPhone 5 as they may be likely to crash
                   !(navigator.platform === 'iPhone' && screen.width === 320 && screen.height === 480) &&
                   // as are iPads
                   !(navigator.platform === 'iPad');
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
