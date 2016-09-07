define([
    'common/utils/mediator'
], function (
    mediator
) {
    return function () {

        this.id = 'DiscussionExternalFrontendCount';
        this.start = '2016-09-06';
        this.expiry = '2016-09-30';
        this.author = 'Fabio Crisci';
        this.description = 'Load discussion frontend from an external location';
        this.audience = 0.05;
        this.audienceOffset = 0.45;
        this.successMeasure = 'Comment count loads correctly';
        this.showForSensitive = true;
        this.audienceCriteria = 'Browsers with Promise';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return 'fetch' in window && 'Promise' in window &&
                window.curlConfig.paths['discussion-frontend-react'] &&
                window.curlConfig.paths['discussion-frontend-preact'];
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('comments-count-loaded', complete);
                    }
                }.bind(this)
            },
            {
                id: 'react',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('comments-count-loaded', complete);
                    }
                }.bind(this)
            },
            {
                id: 'preact',
                test: function () {},
                success: function (complete) {
                    if (this.canRun()) {
                        mediator.on('comments-count-loaded', complete);
                    }
                }.bind(this)
            }
        ];
    };
});
