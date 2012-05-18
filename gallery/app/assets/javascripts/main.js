(function(){

    require([guardian.js.modules.detect, guardian.js.modules.images, guardian.js.modules.reqwest, guardian.js.modules.bean, guardian.js.modules.fetchDiscussion], function(detect, images, reqwest, bean) {

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

        // todo - work out where to load discussion and trailexpander
        // and also if the URLs are wrong...

    });

})();