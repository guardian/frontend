define([
], function (
) {
    return function () {
        this.id = 'RemoveStickyNav';
        this.start = '2015-1-07';
        this.expiry = '2016-3-1';
        this.author = 'Josh Holder';
        this.description = '0% AB test for removing the sticky nav';
        this.audience = 0.0;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'old',
                test: function () {

                }
            },
            {
                id: 'new',
                test: function () {

                }
            }
        ];
    };
});
