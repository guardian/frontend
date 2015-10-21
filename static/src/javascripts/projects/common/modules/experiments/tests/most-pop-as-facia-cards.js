define([
], function (
) {
    return function () {
        this.id = 'MostPopAsFaciaCards';
        this.start = '2015-10-21';
        this.expiry = '2015-11-21';
        this.author = 'Josh Holder';
        this.description = 'Styles the most popular container as facia cards';
        this.audience = 0.2;
        this.audienceOffset = 0.025;
        this.successMeasure = 'The number of onward journeys increases';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'popular-container-as-facia-cards';
        this.idealOutcome = '';

        this.canRun = function () {
            return window.guardian.config.page.contentType === 'Article';
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
