define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    config,
    detect,
    mediator
) {
    return function () {

        this.id = 'DiscussionPromoteComments';
        this.start = '2016-09-23';
        this.expiry = '2016-10-12';
        this.author = 'Fabio Crisci';
        this.description = 'Test different ways to promote comments';
        this.audience = 0.1;
        this.audienceOffset = 0.35;
        this.successMeasure = 'Users interact more with comments';
        this.showForSensitive = true;
        this.audienceCriteria = 'Modern browsers, mobile only on articles and live blogs';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            var type = config.page.contentType;
            return 'fetch' in window && 'Promise' in window &&
                window.curlConfig.paths['discussion-frontend-react'] &&
                window.curlConfig.paths['discussion-frontend-preact'] &&
                (type === 'Article' || type === 'LiveBlog') &&
                detect.isBreakpoint({ max: 'tablet' });
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }.bind(this)
            },
            {
                id: 'bottom-banner',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }.bind(this)
            },
            {
                id: 'top-banner',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }.bind(this)
            },
            {
                id: 'bubble',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }.bind(this)
            }
        ];
    };
});
