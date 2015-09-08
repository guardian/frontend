define([
    'common/utils/$'
], function (
   $
) {
    return function () {

        this.id = 'DisableAdsSurvey';
        this.start = '2015-09-01';
        this.expiry = '2015-10-01';
        this.author = 'Zofia Korcz';
        this.description = 'Survey to test if users will be interested in paying for the Guardian with no ads';
        this.audience = 0.15;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Users will be interested in paying for the non-ads Guardian';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'hide ads hide adslot: {slot size}, survey overlay take part';
        this.idealOutcome = 'Users will be interested in paying a lot for the non-ads Guardian';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                }
            },
            {
                id: 'challenger',
                test: function () {
                    /*TODO variant with just a link*/
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});

