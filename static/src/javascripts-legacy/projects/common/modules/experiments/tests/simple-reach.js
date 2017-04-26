define([
], function (
) {
    return function () {
        this.id = 'SimpleReach';
        this.start = '2017-04-13';
        this.expiry = '2017-05-03';
        this.author = 'Kate Whalen';
        this.description = 'Add SimpleReach opt-in behind query param, so we can test it';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'SimpleReach can opt-in and check the implementation';
        this.audienceCriteria = 'SimpleReach team';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
          return true;
        };

        this.variants = [
            {
                id: 'opt-in',
                test: function () {
                }
            },
            {
                id: 'opt-out',
                test: function () {
                }
            }
        ];
    };
});
