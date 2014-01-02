define(['common/$'], function ($) {

    var ExperimentTagLinking = function () {

        this.id = 'TagLinking';
        this.expiry = "2014-01-20";
        this.audience = 0.3;
        this.audienceOffset = 0.7;
        this.description = 'Auto links to tags if the article has no other links in the body';
        this.canRun = function(config) {
            return (
                //only the pages we are interested in will have these items on them
                $('.unlinked-tag-name').length > 0
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
                id: 'link-tags',
                test: function (context) {
                    $('.unlinked-tag-name').hide();
                    $('.linked-tag-name').removeClass('is-hidden');
                }
            }
        ];
    };

    return ExperimentTagLinking;

});