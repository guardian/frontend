define([], function (
) {
    return function () {
        this.id = 'PlatformStickyAdViewability';
        this.start = '2016-11-17';
        this.expiry = '2016-11-24';
        this.author = 'Gareth Trufitt';
        this.description = 'Test the affect of showing the navigation on the viewability of the sticky top ad';
        this.audience = 0.05; // (5%) - 8M ad impressions, 4% MDE at 50% baseline conversion is 8,100 - a minimum of 1% for a day for SS
        this.audienceOffset = 0.1;
        this.successMeasure = 'The DFP viewability of the variant drops no more than 4%';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Viewability of the sticky ad does not drop when the navigation is shown';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };
});
