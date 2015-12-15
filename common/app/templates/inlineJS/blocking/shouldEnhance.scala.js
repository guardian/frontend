@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

// Determine whether we want to run the enhanced app or not.
// It can come either from a preference in localStorage (see `enhancedKey`)
// or from a temporary opt-in or -out override, using `#standard` or `#enhanced` hash fragments.

(function (window) {
    var location = window.location;
    var hash = location.hash;

    var navigator = window.navigator;
    var platform = navigator.platform;

    var isFront = @item.isFront;
    var enhancedKey = 'gu.prefs.enhanced';

    var preferEnhanced;
    try {
        preferEnhanced = JSON.parse(localStorage.getItem(enhancedKey));
    } catch (e) {
        preferEnhanced = null;
    };

    // This has been called core, featuresoff, universal etc, and a few previous ways of
    // opting in and out existed.
    // Now we have settled on standard and enhanced, the previous methods are handled
    // here, temporarily. This function can go after a while.
    function normaliseNomenclature() {
        var coreKey = 'gu.prefs.force-core', settingCorePref, corePref;

        // update any `force-core` stored pref
        try {
            var localStorage = window.localStorage;
            if (corePref = localStorage.getItem(coreKey)) {
                localStorage.setItem(enhancedKey, /off/.test(corePref));
                localStorage.removeItem(coreKey);
            }
        } catch (e) {};

        // hijack any attempt to use the old hash-fragments
        if (hash.length) {
            // if we're trying to set an old pref, set the new one
            if ((settingCorePref = new RegExp(`^#${coreKey.replace('.', '\.')}=(on|off)$`).exec(hash)) && (corePref = settingCorePref[1])) {
                hash = location.hash = `#${enhancedKey}=${corePref === 'off'}`;
            }
            // swap out the old temporary opt-in/out methods for the finalised ones
            else if (/^#(featuresoff|core)$/.test(hash)) {
                hash = location.hash = '#standard';
            } else if (/^#(featureson|nocore)$/.test(hash)) {
                hash = location.hash = '#enhanced';
            }
        }
    };

    function mustEnhance() {
        if (hash === '#enhanced' || hash === `#${enhancedKey}=true`) return true;
        if (preferEnhanced) return true;
        return false;
    };

    function mustNotEnhance() {
        return hash === '#standard' || hash === `#${enhancedKey}=false`;
    };

    function couldEnhance() {
        return preferEnhanced !== false;
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
    window.shouldEnhance = mustNotEnhance() ? false : mustEnhance() ? true : couldEnhance() && weWantToEnhance();

    // just so we can tell…
    console && console.info && console.info(`THIS IS ${window.shouldEnhance ? 'ENHANCED' : 'STANDARD ONLY'}`);
})(window);




