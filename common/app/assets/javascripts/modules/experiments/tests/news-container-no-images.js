define([
    'common/utils/$',
    'common/utils/config'
], function(
    $,
    config
) {
    return function() {

        this.id = 'NewsContainerNoImages';
        this.start = '2014-08-04';
        this.expiry = '2014-08-15';
        this.author = 'James Gorrie';
        this.description = 'Hide images on standard items in the news container';
        this.audience = 0.5;
        this.audienceOffset = 0.75;
        this.successMeasure = 'More clickthroughs on the news container';
        this.audienceCriteria = 'Everyone';
        this.idealOutcome = 'Clicks do not drop on the news container, and hopefully increase on the stories above.';
        this.canRun = function () { return config.page.contentType === 'Network Front'; };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'no-images-standard',
                test: function () {
                    $('.container--news').each(function(el) {
                        $('.linkslist-container .linkslist__media-wrapper, .l-row--items-4 .item__media-wrapper, .l-row--items-4 .item__image-container', el)
                            .remove();
                        $('.action--has-image', el).removeClass('action--has-image');
                    });
                }
            }
        ];
    };
});