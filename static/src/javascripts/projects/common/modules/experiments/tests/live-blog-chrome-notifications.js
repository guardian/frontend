define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function(
    $,
    config,
    detect,
    mediator
) {
    return function () {

        this.id = 'LiveBlogChromeNotifications';
        this.start = '2016-03-03';
        this.expiry = '2016-06-01';
        this.author = 'Nathaniel Bennett';
        this.description = 'Allows users to to subscribe to live blogs on chrome - internal users only';
        this.audience = 0.0;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.audienceCriteria = 'Internal use only ap';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function() {
            var run = detect.getUserAgent.browser === 'Chrome' && config.page.contentType === 'LiveBlog'
            console.log("++ Run: " + run);
            return run;
        };

        this.variants = [
            {
                id: 'control',
                test: function() {
                    console.log("++ AB Test");
                    mediator.on('page:notifications:ready', function(){
                       console.log("++ AB - notifications Ready");
                    });
                }
            }
        ];
    };
});
