define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'FrontsOnArticles';
        this.start = '2015-11-30';
        this.expiry = '2015-12-30';
        this.author = 'Josh Holder';
        this.description = 'Inject fronts containers on articles';
        this.audience = 0.0;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return !config.page.isFront && config.page.section !== 'childrens-books-site';
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
