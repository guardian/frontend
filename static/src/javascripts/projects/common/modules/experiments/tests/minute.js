define([
], function (
) {
    return function () {
        this.id = 'Minute';
        this.start = '2016-04-11';
        this.expiry = '2016-05-16';
        this.author = 'James Gorrie';
        this.description = 'Just so we can test the minute product, not to be seen by users';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'on',
                test: function () {}
            }
        ];
    };
});
