define([
    'common/utils/mediator',
    'common/utils/config',
    'common/utils/detect',

    'common/modules/analytics/beacon'
], function (
    mediator,
    config,
    detect,

    beacon
) {

    function LiveBlogMetrics() {

        var repeat = false,
            pageViews = ['live-blog-page-view'];

        if (config.page.isLive) {
            mediator.once('page:liveblog:ready', function () {

                if (detect.isReload()) {
                    pageViews.push('live-blog-page-refresh');
                }

                beacon.counts(pageViews);
            });

            mediator.on('modules:autoupdate:updates', function () {
                if (!repeat) {
                    beacon.counts('live-blog-update-seen');
                    repeat = true;
                } else {
                    beacon.counts('live-blog-repeat-update-seen');
                }
            });
        }
    }

    return {
        init: LiveBlogMetrics
    };

});
