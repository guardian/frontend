@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._

// Determine whether we want to run the enhanced app or not.
// It can come either from a preference in localStorage (see `enhanceKey`)
// or from a temporary opt-in or -out, using `#standard` or `#enhance` hashes.

(function (window) {
    var location = window.location;
    var hash = location.hash;

    var navigator = window.navigator;
    var platform = navigator.platform;
    var isFront = @item.isFront;

    var enhanceKey = 'gu.prefs.enhance';

    // This been called core, no-features, universal, etc, and a few previous ways of
    // opting in and out exist.
    // Now we have settled on standard and enhanced, the previous methods are handled
    // here, temporarily. This function can go after a while.
    function normaliseNomenclature() {
        var coreKey = 'gu.prefs.force-core';
        var settingCorePref, corePref;

        try {
            // update any `force-core` stored pref
            var localStorage = window.localStorage;
            var forceCorePref = localStorage.getItem(coreKey);
            if (forceCorePref) {
                localStorage.setItem(enhanceKey, forceCorePref === 'off');
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

    function couldEnhance() {
        if (hash === '#standard' || hash === `#${enhanceKey}=false`) return false;
        try {
            return localStorage.getItem(enhanceKey) !== 'false';
        } catch (e) {};

        return true; // presume we *want* to enhance
    };

    function mustEnhance() {
        if (hash === '#enhance' || hash === `#${enhanceKey}=true`) return true;
        try {
            return localStorage.getItem(enhanceKey) === 'true';
        } catch (e) {};

        return false; // presume we don't *have* to enhance
    };

    // If this is an older iOS, we presume it's an older device (they stop being upgradeable at some point).
    // Old here means iOS 3-6.
    // For usage stats see http://david-smith.org/iosversionstats/
    function isOlderIOSDevice() {
        return /.*(iPhone|iPad; CPU) OS ([3456])_\d+.*/.test(navigator.userAgent);
    };

    function isIpad() {
        return (platform === 'iPad');
    };

    function weWantToEnhance() {
        if isOlderIOSDevice() return false;
        if (isFront) return !isIpad();
        return true;
    };

    normaliseNomenclature();
    window.shouldEnhance = mustEnhance() || (couldEnhance() && weWantToEnhance());
    console && console.info && console.info(`THIS IS${window.shouldEnhance ? ' ' : ' NOT '}ENHANCED`);
})(window);




