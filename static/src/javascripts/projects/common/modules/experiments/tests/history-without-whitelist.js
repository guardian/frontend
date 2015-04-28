define([], function () {

    return function () {
        this.id = 'HistoryWithoutWhitelist';
        this.start = '2015-04-21';
        this.expiry = '2015-05-21';
        this.author = 'Stephan Fowler';
        this.description = 'Checking the effect of removing the history whitelist, and instead adding a minimum threshold of 5 article views (or 1 front view)';
        this.audience = 0.2;
        this.audienceOffset = 0.8;
        this.successMeasure = '';
        this.audienceCriteria = 'All visitors';
        this.dataLinkNames = '';
        this.idealOutcome = 'No negative impact on engagement with the personalised history tags';
        this.showForSensitive = false;

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'no-whitelist',
                test: function () {}
            }
        ];
    };

});
