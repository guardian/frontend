
//Disable as I cannot deploy the service
//require('mostPopular');
//require('related');

//todo only load for percentage of users
require(['http://cdn.optimizely.com/js/' + guardian.page.optimizelyId + '.js'], function(optimizely){})

//these are plugins required by all pages
define('adsAndTracking', [guardian.js.modules.analytics, guardian.js.modules.ads], function(analytics, ads){});

// show some debug info and upgrade images if supported
define('detectAndImages', [guardian.js.modules.detect, guardian.js.modules.images], function(detect, images){

    // we should hide debug panel for non-dev environments
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

    // hacky workaround for checking if debug is on. todo: fix
    var debug = document.getElementById('debug');
    if (debug.length) {
        for (var key in gu_debug) {
            document.getElementById(key).innerText = gu_debug[key];
        }
    }

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