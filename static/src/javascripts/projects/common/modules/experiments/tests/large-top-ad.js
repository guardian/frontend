define([], function () {
    return function () {
        this.id = 'LargeTopAd';
        this.start = '2015-10-27';
        this.expiry = '2015-11-30';
        this.author = 'Steve Vadocz';
        this.description = 'Test to see how user will behave depending on this ad format';
        this.audience = 0.995;
        this.audienceOffset = 0;
        this.successMeasure = 'We will see clear difference between user behavior';
        this.audienceCriteria = 'Users in US edition';
        this.dataLinkNames = '';
        this.idealOutcome = 'We can tell if this ad format is desirable in the future or what cost it has to the engagement.';

        this.canRun = function () {
            return window.guardian.config.page.edition === 'US';
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };
});
