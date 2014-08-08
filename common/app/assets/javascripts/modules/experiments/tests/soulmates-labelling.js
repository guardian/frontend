define([
    'common/utils/$',
    'common/utils/detect'
], function(
    $,
    detect
) {
    return function() {

        this.id = 'SoulmatesLabelling';
        this.start = '2014-08-08';
        this.expiry = '2014-08-22';
        this.author = 'Darren Hurley';
        this.description = 'Display either "soulmates" or "dating" label';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'CTR';
        this.audienceCriteria = 'Desktop+ breakpoint';
        this.dataLinkNames = 'topNav : soulmates';
        this.idealOutcome = 'Increased CTR.';

        this.canRun = function () {
            return ['desktop', 'wide'].indexOf(detect.getBreakpoint()) > -1;
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
