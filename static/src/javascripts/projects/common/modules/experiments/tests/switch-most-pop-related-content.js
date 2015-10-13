define([
], function (
) {
    return function () {
        this.id = 'MostPopRelContPosition';
        this.start = '2015-10-14';
        this.expiry = '2015-11-15';
        this.author = 'Josh Holder';
        this.description = 'Switches the location of the most popular and related content containers';
        this.audience = 0.025;
        this.audienceOffset = 0;
        this.successMeasure = 'The number of onward journeys increases';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return guardian.config.page.contentType === 'Article';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'switched',
                test: function () {

                }
            }
        ];
    };
});
