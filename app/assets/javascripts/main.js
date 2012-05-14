requirejs.config({
    paths: guardian.js.modules
});

//High priority modules
require([guardian.js.modules.detect,
    guardian.js.modules.images],

    function(detect, images, discussion, trailExpander) {

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

    // Find and upgrade images.
    images.upgrade();

});

//lower priority modules
require([guardian.js.modules.mostPopular,
    guardian.js.modules.ads,
    guardian.js.modules.fetchDiscussion,
    guardian.js.modules.trailExpander],

    function(mostPopular, ads, discussion, trailExpanders){
        trailExpander.bindExpanders();
    }
);
