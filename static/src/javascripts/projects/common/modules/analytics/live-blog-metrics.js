define([
    'common/modules/analytics/beacon',
    'common/utils/mediator',
    'common/utils/config'
], function (
    beacon,
    mediator,
    config
) {

    function LiveBlogMetrics() {

        var repeat = false;

        if (config.page.isLive) {
            mediator.once('page:liveblog:ready', function () {
                beacon.counts('live-blog-page-view');
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
