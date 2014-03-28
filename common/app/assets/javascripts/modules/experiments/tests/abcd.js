define([], function() {

    var noop = function() {};

    var Abcd = function() {

        this.id = 'Abcd';
        this.start = '2014-03-28';
        this.expiry = '2014-04-28';
        this.author = 'Patrick';
        this.description = 'Canary test to validate the framework and reporting suite.';
        this.audience = 0.2;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Correct reporting of data.';
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = 'Valid data.';

        this.canRun = function() {
            return true;
        };

        this.variants = [
            {
                id: 'a',
                test: noop
            },
            {
                id: 'b',
                test: noop
            },
            {
                id: 'c',
                test: noop
            },
            {
                id: 'd',
                test: noop
            }
        ];

        this.notInTest = noop;
    };

    return Abcd;

});