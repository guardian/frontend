define([
    'common/utils/config',
    'common/utils/detect'
], function (
    config,
    detect
) {
    return function () {

        this.id = 'LiveBlogChromeNotificationsInternal';
        this.start = '2016-03-03';
        this.expiry = '2016-08-31';
        this.author = 'Nathaniel Bennett';
        this.description = 'Allows users to to subscribe to live blogs on chrome - internal users only';
        this.audience = 0.0;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.showForSensitive = true;
        this.audienceCriteria = 'Internal use only ap';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return detect.getUserAgent.browser === 'Chrome' && config.page.contentType === 'LiveBlog';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});
