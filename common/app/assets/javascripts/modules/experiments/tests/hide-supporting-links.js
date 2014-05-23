define([
    'qwery',
    'common/$'
], function (
    qwery,
    $
    ) {

    return function () {

        this.id = 'ABHideSupportingLinks';
        // not starting the test just yet, in now so we can style the component correctly for this spot
        this.start = '2014-05-28';
        this.expiry = '2014-06-24';
        this.author = 'Raul Tudor';
        this.description = 'Test user retention upon hiding the article supporting links on facia fronts';
        this.audience = 0.08;
        this.audienceOffset = 0.92;
        this.successMeasure = 'Click through rates on front overall and clicks on news container';
        this.audienceCriteria = 'Audience to the fronts';
        this.dataLinkNames = 'Hide supporting links on mobile';
        this.idealOutcome = 'Ideal outcome is that click through is increased overall';

        this.canRun = function (config) {
            // only apply on facia fronts
            return config.page.isFront;
        };

        this.variants = [
            {
                id: 'show-all',
                test: function () {
                    // do nothing
                }
            },
            {
                id: 'hide-all',
                test: function () {
                    var allLinks = $('.supporting-links--style-fit > ul a');
                    allLinks.hide();
                }
            },
            {
                id: 'show-visited',
                test: function () {

                }
            },
            {
                id: 'show-if-homepage',
                test: function () {

                }
            }
        ];
    };

});
