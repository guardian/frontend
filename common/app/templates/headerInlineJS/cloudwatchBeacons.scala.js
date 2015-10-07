@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

@if(IphoneConfidence.isSwitchedOn && Seq("uk", "us", "au").contains(item.id)) {

    (function (window, navigator) {
        var coreOptedIn = function () {
            try {
                var corePref = window.localStorage.getItem('gu.prefs.force-core');
                if (corePref) {
                    if ((JSON.parse(corePref).value) === "on") {
                        return true;
                    }
                }
                return false;
            } catch (e) {
                return false;
            }
        };


        function logDevice(model, device) {
            var identifier = function() {
                var id = device + '-' + model;
                if ((device === 'ipad' && model === 'retina')) {
                    if (coreOptedIn()) {
                        return id + '-core-opted-in';
                    }
                    if (window.serveCoreFronts) {
                        return id + '-core-fronts-test';
                    } else {
                        return id + '-core-fronts-control';
                    }
                }
                return id;
            };

            // send immediate beacon
            (new Image()).src = window.guardian.config.page.beaconUrl + '/count/' + identifier() + '-start.gif';

            // send second after 5 seconds, if we're still around
            window.setTimeout(function () {
                (new Image()).src = window.guardian.config.page.beaconUrl + '/count/' + identifier() + '-after-5.gif';
            }, 5000);

            // send another after 10 seconds
            window.setTimeout(function () {
                (new Image()).src = window.guardian.config.page.beaconUrl + '/count/' + identifier() + '-after-10.gif';
            }, 10000);

            // send last one after 60 seconds
            window.setTimeout(function () {
                (new Image()).src = window.guardian.config.page.beaconUrl + '/count/' + identifier() + '-after-60.gif';
            }, 60000);

        }

        if (navigator.platform === 'iPhone' || navigator.platform === 'iPad') {
            var isIphone = navigator.platform === 'iPhone';

            // http://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions
            var isIphone6 = isIphone && (screen.width === 375 && screen.height === 667) || (screen.width === 414 && screen.height === 736);
            var isIphone4 = isIphone && screen.width === 320 && screen.height === 480 && window.devicePixelRatio > 1;

            // ipad1 & 2 (unfortunately this also includes ipad mini) - mitigate that by checking older ios version too.
            // Apple seems to purposefully make this a difficult thing to do.
            var isOlderIpad = !isIphone && window.devicePixelRatio === 1 && /.*iPad; CPU OS ([345])_\d+.*/.test(navigator.userAgent);
            var isIpad2orMini = !isIphone && window.devicePixelRatio === 1 && /.*iPad; CPU OS ([678])_\d+.*/.test(navigator.userAgent);
            var isIpadRetina = !isIphone && window.devicePixelRatio === 2 && /.*iPad;.*/.test(navigator.userAgent);

            if (isOlderIpad) {
                logDevice('old', 'ipad');
            }

            if (isIpad2orMini) {
                logDevice('2orMini', 'ipad');
            }

            if (isIpadRetina) {
                logDevice('retina', 'ipad');
            }

            if (isIphone6) {
                logDevice('6', 'iphone');
            }

            if (isIphone4) {
                logDevice('4', 'iphone');
            }
        }
@* KILL THESE WHILE THE IPAD CORE TEST IS RUNNING TO SAVE £££s ON AWS BEACON COSTS
        (REMEMBER TO UPDATE diagnostics/app/model/diagnostics/analytics/Metric.scala IF RE-ENABLING)
        // This is a subset of the navigator.platform values used by Android. We may need to add more to capture more devices
        //if ((navigator.platform === 'Linux armv7l') || (navigator.platform === 'Linux aarch64') || (navigator.platform === 'Android')) {
        //    var isNexus5 = /.*Nexus 5 */.test(navigator.userAgent);
        //
        //    if (isNexus5) {
        //        logDevice('nexus5', 'android');
        //    }
        //}
        //
        //// Send AWS beacons for Windows7 Chrome & Opera users (user agent is almost identical). This is so we have a indicator of loss on something which we are confident is stable
        //if (navigator.platform === 'Win32') {
        //    if ((/Windows NT 6.1; WOW64/.test(navigator.userAgent)) && (/Chrome/.test(navigator.userAgent))) {
        //        logDevice('chrome', 'windows7');
        //    }
        //}
*@
    })(window, navigator);
}
