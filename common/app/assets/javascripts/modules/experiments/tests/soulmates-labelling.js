define([
    'common/utils/$'
], function(
    $
) {
    return function() {

        this.id = 'SoulmatesLabelling';
        this.start = '2014-08-27';
        this.expiry = '2014-09-10';
        this.author = 'Darren Hurley';
        this.description = 'Display either "soulmates" or "dating" label';
        this.audience = 0.2;
        this.audienceOffset = 0.1;
        this.successMeasure = 'CTR';
        this.audienceCriteria = 'Everyone';
        this.dataLinkNames = 'topNav : soulmates';
        this.idealOutcome = 'Increased CTR.';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'dating',
                test: function () {
                    $('.js-brand-bar__item--soulmates-label').text('dating');
                }
            }
        ];
    };
});
