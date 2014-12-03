define([
    'common/modules/onward/breaking-news',
    'common/utils/config'
], function (
    breakingNews,
    config
) {
    return function () {
        this.id = 'BreakingNewsAlertStyle';
        this.start = '2014-11-26';
        this.expiry = '2015-02-01';
        this.author = 'Alex Sanders';
        this.description = 'Test the efficacy of different alert types for breaking news';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'bottom',
                test: function () {
                    if (config.switches.breakingNews) {
                        breakingNews();
                    }
                }
            }
        ];
    };

});
