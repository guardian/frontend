@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

// Determine whether we want to run the enhanced app or not.
// It can come either from a preference in localStorage (see `enhanceKey`)
// or from a temporary opt-in or -out override, using `#standard` or `#enhance` hash fragments.

(function (window) {
    var location = window.location;
    var hash = location.hash;

    var navigator = window.navigator;
    var platform = navigator.platform;
    var isFront = @item.isFront;

    var enhanceKey = 'gu.prefs.enhance';

    // This has been called core, no-features, universal etc, and a few previous ways of
    // opting in and out existed.
    // Now we have settled on standard and enhanced, the previous methods are handled
    // here, temporarily. This function can go after a while.
    function normaliseNomenclature() {
        var coreKey = 'gu.prefs.force-core', settingCorePref, corePref;

        // update any `force-core` stored pref
        try {
            var localStorage = window.localStorage;
            if (corePref = localStorage.getItem(coreKey)) {
                localStorage.setItem(enhanceKey, /off/.test(corePref));
                localStorage.removeItem(coreKey);
            }
        } catch (e) {};

        // hijack any attempt to use the old hash-fragments
        if (hash.length) {
            // if we're trying to set an old pref, set the new one
            if ((settingCorePref = new RegExp(`^#${coreKey.replace('.', '\.')}=(on|off)$`).exec(hash)) && (corePref = settingCorePref[1])) {
                hash = location.hash = `#${enhanceKey}=${corePref === 'off'}`;
            }
            // swap out the old temporary opt-in/out methods for the finalised ones
            else if (/^#(featuresoff|core)$/.test(hash)) {
                hash = location.hash = '#standard';
            } else if (/^#(featureson|nocore)$/.test(hash)) {
                hash = location.hash = '#enhance';
            }
        }
    };

    function mustEnhance() {
        if (hash === '#enhance' || hash === `#${enhanceKey}=true`) return true;
        try {
            if (JSON.parse(localStorage.getItem(enhanceKey)).value) return true;
        } catch (e) {};

        return false;
    };

    function mustNotEnhance() {
        return hash === '#standard' || hash === `#${enhanceKey}=false`;
    };

    function couldEnhance() {
        try {
            return !/false/.test(localStorage.getItem(enhanceKey));
        } catch (e) {};

        return true; // assume we're going to enhance if we can
    };

    function weWantToEnhance() {
        if (isOlderIOSDevice()) return false;
        if (isFront) return !isIpad();
        return true; // assume we want to enhance
    };

    // If this is an older iOS, we assume it's an older device (they stop being upgradeable at some point).
    // Old here means iOS 3-6.
    // For usage stats see http://david-smith.org/iosversionstats/
    function isOlderIOSDevice() {
        return /.*(iPhone|iPad; CPU) OS ([3456])_\d+.*/.test(navigator.userAgent);
    };

    function isIpad() {
        return (platform === 'iPad');
    };

    // clean up old names before checking the ones we'll expect from now on
    normaliseNomenclature();

    // down to business
    window.shouldEnhance = mustNotEnhance() ? false : mustEnhance() || (couldEnhance() && weWantToEnhance());

    // just so we can tell…
    console && console.info && console.info(`THIS IS ${window.shouldEnhance ? 'ENHANCED' : 'STANDARD ONLY'}`);
})(window);




