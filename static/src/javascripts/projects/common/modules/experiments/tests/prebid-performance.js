define([], function () {
    return function () {
        this.id = 'PrebidPerformance';
        this.start = '2016-01-11';
        this.expiry = '2016-01-31';
        this.author = 'Jimmy Breck-McKye';
        this.description = 'run prebid.js header-bidding auctions before displaying DFP advertising';

        // todo What should these be?
        this.audience = 0.02;
        this.audienceOffset = 0.2;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            // todo To be defined
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'active',
                test: function () {

                }
            }
        ];
    };
});
