define([
    'common/utils/config',
    'common/utils/detect'
], function (
    config,
    detect
) {
    return function () {
        this.id = 'UpgradeMobileRichLinksBelowViewport';
        this.start = '2016-09-27';
        this.expiry = '2016-10-13';
        this.author = 'Gareth Trufitt';
        this.description = 'Test whether the loyalty of users decreases with non-enhanced rich links above current viewport';
        this.audience = 0.2;
        this.audienceOffset = 0.6;
        this.successMeasure = 'No major drop in overall article page CTR & no major drop in article visits per browser per day';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Happier users & no major drop in article visits per browser per day';

        this.canRun = function () {
            return config.page.isContent && detect.isBreakpoint({max: 'mobile'}) ;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'no-upgrade',
                test: function () {}
            }
        ];
    };
});
