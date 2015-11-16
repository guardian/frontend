define([
], function (
) {
    return function () {
        this.id = 'InjectNetworkFrontTest';
        this.start = '2015-11-16';
        this.expiry = '2015-12-05';
        this.author = 'Josh Holder';
        this.description = 'This test does not affect the page in any way, instead it is a test of the 0% to 2% sample, which has potentially caused us problems twice now.';
        this.audience = 0.02;
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
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'variant',
                test: function () {

                }
            }
        ];
    };
});
