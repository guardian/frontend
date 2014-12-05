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
        this.description = 'Test the efficacy of breaking news alerts';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Click-through for the breaking story.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'breaking news';
        this.idealOutcome = 'Users who see the alert click through to the story.';

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
