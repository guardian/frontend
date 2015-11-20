define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'EssentialReadTest1';
        this.start = '2015-10-20';
        this.expiry = '2015-12-20';
        this.author = 'Josh Holder';
        this.description = 'Replaces related content with the essential read';
        this.audience = 0.02;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'the-essential-read';
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
                id: 'curated',
                test: function () {

                }
            },
            {
                id: 'automated',
                test: function () {

                }
            }
        ];
    };
});
