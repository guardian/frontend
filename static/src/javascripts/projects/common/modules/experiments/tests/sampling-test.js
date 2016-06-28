define([], function () {

    return function () {
        this.id = 'SamplingTest';
        this.start = '2016-06-22';
        this.expiry = '2016-07-22';
        this.author = 'David Furey';
        this.description = 'Test sampling.';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.audienceCriteria = 'All users';
        this.idealOutcome = '50% of users in variant and 50% in control';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'variant',
            test: function () {
            }
        }, {
            id: 'control',
            test: function () {
            }
        }];

    };

});
