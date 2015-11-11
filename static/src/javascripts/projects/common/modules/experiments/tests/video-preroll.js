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
        this.description = 'A test to see if an audience from UK or INT will be interested in video pre-rolls.';
        this.audience = 0.5;
        this.audienceOffset = 0.5;
        this.successMeasure = 'We will see clear difference between user behavior';
        this.audienceCriteria = 'Users not in AU nor US edition';
        this.dataLinkNames = '';
        this.idealOutcome = 'UK and INT audience will be interested in video pre-rolls.';

        this.canRun = function () {
            return config.page.edition === 'UK' || config.page.edition === 'INT';
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
