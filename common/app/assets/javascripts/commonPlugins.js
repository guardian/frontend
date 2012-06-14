//lower priority modules
require([guardian.js.modules["$g"]],
    function($g) {

        // hack-tastic

        function createCookie(name,value,days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
            }
            else var expires = "";
            document.cookie = name+"="+value+expires+"; path=/";
        }

        function eraseCookie(name) {
            createCookie(name,"",-1);
        }

        // set up tests for placement of "more on story" packages
        var urlParams = $g.getUrlVars();

        if(urlParams.mode) {
            var mode = parseInt(urlParams.mode);
            if (mode >= 1 && mode <= 6) { // limit to our 6 test cases for now
                createCookie("moreMode", mode, 100);
            } else { // anything else resets it
                eraseCookie("moreMode");
            }
        }

    }
);

//todo only load for percentage of users
optimizely = optimizely || [];
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