(function (win) {
    function logDevice(model, device) {
        var identifier = device + '-' + model;

        // send immediate beacon
        (new Image()).src = win.guardian.config.page.beaconUrl + '/count/' + identifier + '-start.gif';

        // send second after 5 seconds, if we're still around
        setTimeout(function () {
            (new Image()).src = win.guardian.config.page.beaconUrl + '/count/' + identifier + '-after-5.gif';
        }, 5000);
    }

    if (navigator.platform === 'iPhone' || navigator.platform === 'iPad') {
        var platform = navigator.platform;
        var isIphone = navigator.platform === 'iPhone';

        // http://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions
        var isIphone6 = isIphone && (screen.width === 375 && screen.height === 667) || (screen.width === 414 && screen.height === 736) ;
        var isIphone4 = isIphone && screen.width === 320 && screen.height === 480 && win.devicePixelRatio > 1;

        // ipad1 & 2 (unfortunately this also includes ipad mini) - mitigate that by checking older ios version too.
        // Apple seems to purposefully make this a difficult thing to do.
        var isOlderIpad = !isIphone && win.devicePixelRatio === 1 && /.*iPad; CPU OS ([345])_\d+.*/.test(navigator.userAgent);
        var isIpad2orMini = !isIphone && win.devicePixelRatio === 1 && /.*iPad; CPU OS ([678])_\d+.*/.test(navigator.userAgent);
        var isIpad3orLater = !isIphone && win.devicePixelRatio === 2 && /.*iPad; CPU OS ([678])_\d+.*/.test(navigator.userAgent);

        if (isOlderIpad) {
            logDevice('old', 'ipad');
        }

        if (isIpad2orMini) {
            logDevice('2orMini', 'ipad');
        }

        if (isIpad3orLater) {
            logDevice('3orLater', 'ipad');
        }

        if (isIphone6) {
            logDevice('6', 'iphone');
        }

        if (isIphone4) {
            logDevice('4', 'iphone');
        }
    };

    // This is a subset of the navigator.platform values used by Android. We may need to add more to capture more devices
    if ((navigator.platform === 'Linux armv7l') || (navigator.platform === 'Linux aarch64') || (navigator.platform === 'Android')) {
        var isNexus5 = /.*Nexus 5 */.test(navigator.userAgent);
        var isNexus7 = /.*Nexus 7 */.test(navigator.userAgent);

        // There is a very large variety in model id's for Samsung devices, different id's for different carriers.
        // so we will only really be able to beacon on a subset of the Samsung GS4's that visit us
        var isSGS4 = ((/.*GT-I9500 */.test(navigator.userAgent)) || (/.*GT-I9505 */.test(navigator.userAgent)));
        var isSGS3 = /.*GT-I9300 */.test(navigator.userAgent);

        if (isNexus5) {
            logDevice('nexus5', 'android') ;
        }

        if (isNexus7) {
            logDevice('nexus7', 'android') ;
        }

        if (isSGS4) {
            logDevice('sgs4', 'android') ;
        }

        if (isSGS3) {
            logDevice('sgs3', 'android') ;
        }
    }
})(window);
