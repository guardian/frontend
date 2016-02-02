define([
    'lodash/utilities/noop'
], function (
    noop
) {
    return function () {
        this.id = 'PrebidPerformance';
        this.start = '2016-01-15';
        this.expiry = '2016-02-08';
        this.author = 'Jimmy Breck-McKye';
        this.description = 'run prebid.js header-bidding auctions before displaying DFP advertising';

        this.audience = 0.02;
        this.audienceOffset = 0.1;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: noop
            },
            {
                id: 'variant',
                test: noop
            }
        ];
    };
});
