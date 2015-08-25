@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.Switches._

@if(IphoneConfidence.isSwitchedOn && Seq("uk", "us", "au").contains(item.id)) {

    (function (window, navigator) {
        function logDevice(model, device) {
            var identifier = device + '-' + model;
            @*
                remove the RAF metrics in
                diagnostics/app/model/diagnostics/analytics/Metric.scala
                when removing this too
            *@
            var cssLoader = window.useRAFforCSS ? '-raf' : '';

            // send immediate beacon - adding 1 second delay in an attempt to resolve signal loss on Android and Windows7
            window.setTimeout(function () {
                (new Image()).src = window.guardian.config.page.beaconUrl + '/count/' + identifier + '-start' + cssLoader + '.gif';
            }, 1000);

            // send second after 5 seconds, if we're still around
            window.setTimeout(function () {
                (new Image()).src = window.guardian.config.page.beaconUrl + '/count/' + identifier + '-after-5' + cssLoader + '.gif';
            }, 5000);
        }

        if (navigator.platform === 'iPhone' || navigator.platform === 'iPad') {
            var platform = navigator.platform;
            var isIphone = navigator.platform === 'iPhone';

            // http://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions
            var isIphone6 = isIphone && (screen.width === 375 && screen.height === 667) || (screen.width === 414 && screen.height === 736);
            var isIphone4 = isIphone && screen.width === 320 && screen.height === 480 && window.devicePixelRatio > 1;

            // ipad1 & 2 (unfortunately this also includes ipad mini) - mitigate that by checking older ios version too.
            // Apple seems to purposefully make this a difficult thing to do.
            var isOlderIpad = !isIphone && window.devicePixelRatio === 1 && /.*iPad; CPU OS ([345])_\d+.*/.test(navigator.userAgent);
            var isIpad2orMini = !isIphone && window.devicePixelRatio === 1 && /.*iPad; CPU OS ([678])_\d+.*/.test(navigator.userAgent);
            var isIpad3orLater = !isIphone && window.devicePixelRatio === 2 && /.*iPad; CPU OS ([678])_\d+.*/.test(navigator.userAgent);

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
        }

        // This is a subset of the navigator.platform values used by Android. We may need to add more to capture more devices
        if ((navigator.platform === 'Linux armv7l') || (navigator.platform === 'Linux aarch64') || (navigator.platform === 'Android')) {
            var isNexus5 = /.*Nexus 5 */.test(navigator.userAgent);

            if (isNexus5) {
                logDevice('nexus5', 'android');
            }
        }

        // Send AWS beacons for Windows7 Chrome & Opera users (user agent is almost identical). This is so we have a indicator of loss on something which we are confident is stable
        if (navigator.platform === 'Win32') {
            if ((/Windows NT 6.1; WOW64/.test(navigator.userAgent)) && (/Chrome/.test(navigator.userAgent))) {
                logDevice('chrome', 'windows7');
            }
        }

    })(window, navigator);
}
