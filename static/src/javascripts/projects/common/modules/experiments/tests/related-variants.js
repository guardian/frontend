define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'RelatedVariants';
        this.start = '2016-01-15';
        this.expiry = '2016-02-15';
        this.author = 'Maria Chiorean';
        this.description = 'Gets related content in using 3 new variants';
        this.audience = 0.0;
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
                id: 'tags-only',
                test: function () {

                }
            },
            {
                id: 'tags-headline',
                test: function () {

                }
            },
            {
                id: 'in-body-links',
                test: function () {

                }
            }
        ];
    };
});
