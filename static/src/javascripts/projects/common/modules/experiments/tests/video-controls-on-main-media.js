define([
    'common/utils/$',
    'common/utils/config'
], function (
    $,
    config
) {
    var mainVideo = $('[data-component="main video"]');

    return function () {
        this.id = 'VideoControlsOnMainMedia';
        this.start = '2016-05-19';
        this.expiry = '2016-05-27';
        this.author = 'James Gorrie';
        this.description = 'Showing controls on main media.';
        this.audience = 0.2;
        this.audienceOffset = .03;
        this.successMeasure = '';
        this.audienceCriteria = 'Landing on an article with main media';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.contentType === 'Article' && mainVideo.length > 0;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant1',
                test: function () {
                    mainVideo.addClass('show-media-controls');
                }
            }
        ];
    };
});

