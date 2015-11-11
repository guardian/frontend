@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

(function (navigator, window) {
    // Enable manual optin to core functionality/optout of enhancement
    var personPrefersCore = function () {
        var locationHash = window.location.hash;
        if (locationHash === '#featuresoff' || locationHash === '#core' || locationHash === '#gu.prefs.force-core=on') return true;
        if (locationHash === '#featureson' || locationHash === '#nocore' || locationHash === '#gu.prefs.force-core=off') return false;
        try {
            var preference = window.localStorage.getItem('gu.prefs.force-core') || 'off';
            return /"value":"on"/.test(preference);
        } catch (e) {
            return false;
        }
    };

    // Guess whether the device is too old, regardless of whether it cuts the mustard
    //
    // 'older' iOS normally indicates a device with lower power (they stop being upgradeable at some point).
    // We won't run all javascript on these.
    // For usage stats see http://david-smith.org/iosversionstats/
    //
    // NOTE: this moves people into a category where they do not get important things such as commenting
    var isOlderIOSDevice = function () {

        if (navigator.platform === 'iPhone' || navigator.platform === 'iPad' || navigator.platform === 'iPod') {
            // I'm intentionally being a bit over zealous in the detection department here
            return /.*(iPhone|iPad; CPU) OS ([3456])_\d+.*/.test(navigator.userAgent);
        }
        return false;
    };

    var isIpad = function() {
        return (navigator.platform === 'iPad');
    };

    window.shouldEnhance = !personPrefersCore() && !isOlderIOSDevice() && !(@item.isFront && isIpad());
    window.shouldEnhance || console && console.info && console.info("THIS IS CORE");
})(navigator, window);




