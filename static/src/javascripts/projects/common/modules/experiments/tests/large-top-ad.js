define([], function () {
    return function () {
        this.id = 'LargeTopAd';
        this.start = '2015-10-27';
        this.expiry = '2015-12-31';
        this.author = 'Steve Vadocz';
        this.description = 'This will opt out 1% of US users from the large top ad format.';
        this.audience = 0.01;
        this.audienceOffset = 0.45;
        this.successMeasure = 'We will see clear difference between user behavior';
        this.audienceCriteria = 'Users in US edition';
        this.dataLinkNames = '';
        this.idealOutcome = 'We can tell if the top large ad format is desirable in the future or what cost it has to the engagement.';

        this.canRun = function () {
            return window.guardian.config.page.edition === 'US';
        };

        this.variants = [
            {
                id: 'noad',
                test: function () {}
            },
            {
                id: 'ad',
                test: function () {}
            }
        ];
    };
});
