define([
], function (
) {
    return function () {
        this.id = 'InjectHeadlinesTest';
        this.start = '2015-10-15';
        this.expiry = '2015-11-15';
        this.author = 'Josh Holder';
        this.description = 'Switches the location of the most popular and related content containers';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'The number of onward journeys increases';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'onward-ab-switch-mp-rl, popular-ab-switch-mp-rl';
        this.idealOutcome = '';

        var d = new Date();

        this.canRun = function () {
            return window.guardian.config.page.contentType === 'Article' &&
                   window.guardian.config.page.edition === 'UK' &&
                   d.getHours() >= 6 && d.getHours() < 24 &&
                   ['uk-news','politics','world'].indexOf(window.guardian.config.page.section) > -1;
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
