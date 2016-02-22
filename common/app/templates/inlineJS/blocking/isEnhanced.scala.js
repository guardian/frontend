@(item: model.MetaData)(implicit request: RequestHeader)

// Determine whether we want to run the enhanced app or not.
// It can come either from a preference in localStorage (see `enhancedKey`)
// or from a temporary opt-in or -out override, using `#standard` or `#enhanced` hash fragments.

(function (window) {
    var guardian = window.guardian;
    guardian.isEnhanced = guardian.isModernBrowser && shouldEnhance();

    // just so we can tell…
    @if(play.Play.isDev()) {
        window.console && window.console.info(`THIS IS ${guardian.isEnhanced ? 'ENHANCED' : 'STANDARD ONLY'}`);
    }

    function shouldEnhance() {
        var location = window.location;
        var hash = location.hash;

        var navigator = window.navigator;
        var platform = navigator.platform;

        var isFront = @item.isFront;
        var enhancedKey = 'gu.prefs.enhanced';
        var preferEnhanced;

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

        try {
            preferEnhanced = JSON.parse(localStorage.getItem(enhancedKey)).value;
        } catch (e) {
            preferEnhanced = null;
        };

        return mustNotEnhance() ? false : mustEnhance() ? true : couldEnhance() && weWantToEnhance();
    }


})(window);
