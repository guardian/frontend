define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'VideoPreroll';
        this.start = '2015-11-11';
        this.expiry = '2015-12-11';
        this.author = 'Zofia Korcz';
        this.description = 'A test to see if a non australian audience will be interested in video pre-rolls.';
        this.audience = 0.01;
        this.audienceOffset = 0.5;
        this.successMeasure = 'We will see clear difference between user behavior';
        this.audienceCriteria = 'Users not in AU edition';
        this.dataLinkNames = '';
        this.idealOutcome = 'Non australian audience will be interested in video pre-rolls.';

        this.canRun = function () {
            return config.page.edition !== 'AU';
        };

        this.variants = [
            {
                id: 'preroll',
                test: function () {}
            },
            {
                id: 'nopreroll',
                test: function () {}
            }
        ];
    };
});
