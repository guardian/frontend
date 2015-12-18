define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'FrontsOnArticles';
        this.start = '2015-12-08';
        this.expiry = '2016-1-30';
        this.author = 'Josh Holder';
        this.description = 'Inject fronts containers on articles';
        this.audience = 0.06;
        this.audienceOffset = 0.25;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return !config.page.isFront && config.page.section !== 'childrens-books-site' && config.page.contentType !== 'LiveBlog';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'oneAndThree',
                test: function () {

                }
            },
            {
                id: 'twoAndTwo',
                test: function () {

                }
            }
        ];
    };
});
