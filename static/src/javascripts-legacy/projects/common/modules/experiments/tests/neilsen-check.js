define([
], function (
) {
    return function () {
        this.id = 'NeilsenCheck';
        this.start = '2017-01-19';
        this.expiry = '2017-01-31';
        this.author = 'Kate Whalen';
        this.description = 'Letting Neilsen opt in to get the updated script';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Neilsen can opt-in and see the new params';
        this.audienceCriteria = 'Neilsen team';
        this.dataLinkNames = '';
        this.idealOutcome = 'Neilsen are happy, and they stop iterating on the instructions';

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
