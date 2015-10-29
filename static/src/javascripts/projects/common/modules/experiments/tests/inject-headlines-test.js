define([
], function (
) {
    return function () {
        this.id = 'InjectHeadlinesTest';
        this.start = '2015-10-15';
        this.expiry = '2015-11-15';
        this.author = 'Josh Holder';
        this.description = 'On article pages in the world, uk-news and politics sections, this replaces the related content container with the headlines container from the homepage, between the hours of 6am and 11am';
        this.audience = 0.2;
        this.audienceOffset = 0.225;
        this.successMeasure = 'The headlines container gets a higher CTR than the related content container';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'morning-briefing-ab';
        this.idealOutcome = '';

        var d = new Date();

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
