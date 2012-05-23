require(["http://3.gu-pasteup.appspot.com/js/detect/detect.js", "http://3.gu-pasteup.appspot.com/js/detect/images.js", "http://cdnjs.cloudflare.com/ajax/libs/zepto/0.8/zepto.min.js"], function(detect, images, zepto) {

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

require([guardian.js.modules.commonPlugins], function(common){});