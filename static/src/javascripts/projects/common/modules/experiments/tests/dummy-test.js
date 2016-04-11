define([
], function (
) {
    return function () {
        this.id = 'DummyTest';
        this.start = '2016-04-07';
        this.expiry = '2016-05-10';
        this.author = 'Stephan Fowler';
        this.description = 'A do-nothing AA test, for the data team';
        this.audience = 0.06;
        this.audienceOffset = 0.75;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'A1',
                test: function () {}
            },
            {
                id: 'A2',
                test: function () {}
            }
        ];
    };
});
