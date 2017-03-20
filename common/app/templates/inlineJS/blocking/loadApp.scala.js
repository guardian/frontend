@()(implicit request: RequestHeader)
@import conf.Static
@import conf.Configuration

// the app is bundled without any polyfills. babel transpiles the syntax
// to es5 but we do provide any polyfills for missing methods.
// for that, we use polyfill.io.
//
// since that's a possbile point of failure, we have a checked-in copy of
// the pf.io response for *all* polyfills that we will serve to everyone
// as a worst-case back up.
//
// they're gated, meaning they won't patch if they don't need to, but
// they're still downloaded (currently ~20 kB gzipped)

// this is a global that's called at the bottom of the pf.io response,
// once the polyfills have run.
function guardianPolyfilled() {
    try {
        // boot.js uses one of these to kick the app off,
        // depending on which js file loads first
        window.guardian.polyfilled = true;
        window.guardian.onPolyfilled();
    } catch (e) {};
}

// Load the app and try to patch the env with polyfill.io
(function (document, window) {
    var ref = document.getElementsByTagName('script')[0];
    var fallbackScript;

    // because we're potentially setting up a race condition (polyfill.io and fallback)
    // we need a way to stop one of the scripts evaling if they both get requested
    function disableScript(script) {
        if(script) {
            script.type = 'ignore-this-script';
        }
    }

    // if polyfill.io fails or times out, we'll load our fallback
    function loadFallback () {
        fallbackScript = document.createElement('script');
        fallbackScript.src = '@Static("javascripts/vendor/polyfillio.fallback.js")';
        fallbackScript.onload = function () {
            // if this ends up loading before polyfill.io, make sure
            // polyfill.io response isn't also applied
            disableScript(polyfillScript);
        };
        ref.parentNode.insertBefore(fallbackScript, appScript);
    }

    // the app will probably take longest to load, so let's
    // get it loading ASAP. it won't do anything till the polyfills
    // have run anyway
    var appScript = document.createElement('script');
    appScript.src = '@Static("javascripts/graun.standard.js")';
    ref.parentNode.insertBefore(appScript, ref);

    // load polyfills from polyfill.io
    var polyfillScript = document.createElement('script');
    polyfillScript.src = "@common.Assets.js.polyfillioUrl";
    polyfillScript.onerror = function () { // if something goes wrong...
        // 1. ignore this script
        disableScript(polyfillScript);
        // 2. try to cancel the timeout that would have loaded the fallback eventually
        window.clearTimeout(window.guardian.loadPolyfillioFallback);
        // 3. manually load the fallback
        loadFallback();
    };
    polyfillScript.onload = function () { // once we get polyfills from polyfill.io...
        // 1. try to cancel the timeout that would have loaded the fallback eventually
        window.clearTimeout(window.guardian.loadPolyfillioFallback);
        // 2. disable the fallback script
        // why? it's possible this script took too long to arrive and the fallback
        // was triggered, but then this actually arrived *before* the fallback did.
        // in that case, we might as well use this instead of waiting, but we don't
        // want to patch again with the fallback when *it* arrives.
        disableScript(fallbackScript);
    };
    appScript.parentNode.insertBefore(polyfillScript, appScript);

    // give pollyfill.io 3 seconds to arrive before we trigger the fallback
    window.guardian.loadPolyfillioFallback = window.setTimeout(loadFallback, 3000);
})(document, window);
