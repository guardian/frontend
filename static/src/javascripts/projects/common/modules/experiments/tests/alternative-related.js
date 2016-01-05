define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'AlternativeRelated';
        this.start = '2015-12-07';
        this.expiry = '2016-01-07';
        this.author = 'John Duffell';
        this.description = 'gets related content from the top tags instead of the content';
        this.audience = 0.02;
        this.audienceOffset = 0.2;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return !config.page.isFront;
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
