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

    // This has been called core, featuresoff, universal etc, and a few previous ways of
    // opting in and out existed.
    // Now we have settled on standard and enhanced, the previous methods are handled
    // here, temporarily. This can go after a while.
    (function () {
        var coreKey = 'gu.prefs.force-core', settingCorePref, corePref;

        // update any `force-core` stored pref
        try {
            var localStorage = window.localStorage,
                corePref = localStorage.getItem(coreKey);
            if (corePref) {
                localStorage.setItem(enhancedKey, JSON.stringify({value: /off/.test(corePref)}));
                localStorage.removeItem(coreKey);
            }
            // previous version set the pref to a boolean, but
            // prefs use the {value: 'x'} format – correct that
            var enhancedPref = JSON.parse(localStorage.getItem(enhancedKey));
            if (typeof enhancedPref === "boolean") {
                localStorage.setItem(enhancedKey, JSON.stringify({value: enhancedPref}));
            }
        } catch (e) {};

        // hijack any attempt to use the old hash-fragments
        if (hash.length) {
            // if we're trying to set an old pref, set the new one
            settingCorePref = new RegExp(`^#${coreKey.replace('.', '\.')}=(on|off)$`).exec(hash);
            if (settingCorePref && (corePref = settingCorePref[1])) {
                hash = location.hash = `#${enhancedKey}=${corePref === 'off'}`;
            }
            // swap out the old temporary opt-in/out methods for the finalised ones
            else if (/^#(featuresoff|core)$/.test(hash)) {
                hash = location.hash = '#standard';
            } else if (/^#(featureson|nocore)$/.test(hash)) {
                hash = location.hash = '#enhanced';
            }
        }
    })();
    // now we should be ready for standard/enhanced

    var preferEnhanced;
    try {
        preferEnhanced = JSON.parse(localStorage.getItem(enhancedKey)).value;
    } catch (e) {
        preferEnhanced = null;
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

    // down to business
    window.shouldEnhance = mustNotEnhance() ? false : mustEnhance() ? true : couldEnhance() && weWantToEnhance();

    // just so we can tell…
    var console = window.console;
    console && console.info && console.info(`THIS IS ${window.shouldEnhance ? 'ENHANCED' : 'STANDARD ONLY'}`);
})(window);




