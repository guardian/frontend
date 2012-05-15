requirejs.config({
    paths: guardian.js.modules
});

//High priority modules
require([guardian.js.modules.detect, 
    guardian.js.modules.images, 
    guardian.js.modules.fetchDiscussion, 
    guardian.js.modules.trailExpander, 
    guardian.js.modules.discussionBinder],
    function(detect, images, discussion, trailExpander, discussionBinder) {

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

        // find and upgrade images (if supported)
        images.upgrade();

        // bind expandable trailblocks
        trailExpander.bindExpanders();

        // fetch comments HTML. arguments: shortUrl, commentsPerPage, pageOffset, callback    
        discussion.fetchCommentsForContent(guardian.page.shortUrl, 5, 1, discussionBinder.renderDiscussion);
    });

//lower priority modules
require([guardian.js.modules.mostPopular, 
    guardian.js.modules.ads,
    guardian.js.modules.trailExpander],
    function(mostPopular, ads, trailExpanders){
        trailExpander.bindExpanders();
    }
);
