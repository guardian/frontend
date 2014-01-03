define(['common/$'], function ($) {

    var ExperimentArticleLinking = function () {

        this.id = 'InBodyLinking';
        this.expiry = "2014-01-20";
        this.audience = 0.1;
        this.audienceOffset = 0.3;
        this.description = 'Removes In body links to see change to bounce rate';
        this.canRun = function(config) {
            return (
                //only the pages we are interested in will have these items on them
                $('.ab-in-body-link').length > 0
            );
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                    return true;
                }
            },
            {
                id: 'remove-links',
                test: function (context) {
                    $('.ab-in-body-link').hide();
                    $('.ab-in-body-text').removeClass('is-hidden');
                }
            }
        ];
    };

    return ExperimentArticleLinking;

});