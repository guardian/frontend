define([
    'common/utils/config',
    'qwery',
    'bonzo',
    'common/utils/$'
], function (
    config,
    qwery,
    bonzo,
    $
    ){
    return function()
    {
        this.id = 'VideoCaption';
        this.start = '2016-07-22';
        this.expiry = '2016-07-25';
        this.author = 'Gideon Goldberg';
        this.description = 'Increase the prominence of the video caption on in-article videos.';
        this.audience = 0.06;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Video starts.';
        this.audienceCriteria = 'Users viewing an article with a video embedded.';
        this.dataLinkNames = '';
        this.idealOutcome = 'Video starts are increased';
        this.canRun = function() {
            return config.page.contentType === 'Article' &&  qwery('[data-component="main video"]').length > 0;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                }
            },
            {
                id: 'caption-overlay',
                test: function () {
                }
            },
            {
                id: 'caption-larger-text',
                test: function () {
                    bonzo($('.caption--main a')).addClass('caption--large');
                }
            }
        ];
    };
});
