//these are plugins required by all pages
define('adsAndTracking', [guardian.js.modules.analytics, guardian.js.modules.ads], function(analytics, ads){});

// show some debug info and upgrade images if supported
define('detectAndImages', [guardian.js.modules.detect, guardian.js.modules.images], function(detect, images){


    // we hide debug panel for non-dev environments
    //if (guardian.config.isDev) {
        var gu_debug = {
            screenHeight: screen.height,
            screenWidth: screen.width,
            windowWidth: window.innerWidth || document.body.offsetWidth || 0,
            windowHeight: window.innerHeight || document.body.offsetHeight || 0,
            layout: detect.getLayoutMode(),
            bandwidth: detect.getConnectionSpeed(),
            battery: detect.getBatteryLevel(),
            pixelratio: detect.getPixelRatio(),
            retina: (detect.getPixelRatio() === 2) ? 'true' : 'false'
        };

        for (var key in gu_debug) {
            document.getElementById(key).innerText = gu_debug[key];
        }
    //}

    // Find and upgrade images.
    images.upgrade();
});

// show comments
if (guardian.page.commentable) {
    define('discussion', [guardian.js.modules.fetchDiscussion,
        guardian.js.modules.discussionBinder],
        function(discussion, discussionBinder) {

            // fetch comments html
            discussion.fetchCommentsForContent(
                guardian.page.shortUrl,
                guardian.config.discussion.numCommentsPerPage,
                1, // pageOffset
                discussionBinder.renderDiscussion // callback to send HTML output to
            );

        }
    );
}