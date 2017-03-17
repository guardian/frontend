@()(implicit request: RequestHeader)
@import conf.Static
@import views.support.Polyfillio

// called once the polyfills have all run.
// boot.js uses this to kick the app off
function guardianPolyfilled() {
    try {
        window.guardian.polyfilled = true;
        window.guardian.onPolyfilled();
    } catch (e) {};
}

// Load the app and try to patch the env with polyfill.io
(function (document, window) {
    var appScript = document.createElement('script');
    var polyfillScript = document.createElement('script');
    var fallbackScript;
    var ref = document.getElementsByTagName('script')[0];

    // if polyfill.io fails or times out, we'll load our massive fallback
    // (all polyfills, not targeted at any particular UA)
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

    // because we're potentially setting up a race condition (polyfill.io and fallback)
    // we need a way to stop both scripts evaling if they both get requested
    function disableScript(script) {
        if(script) {
            script.type = 'ignore-this-script';
        }
    }

    // the app will probably take longest to load, so let's
    // get it loading ASAP. it won't do anything till polyfills
    // have run anyway
    appScript.src = '@Static("javascripts/graun.standard.js")';
    ref.parentNode.insertBefore(appScript, ref);

    // load polyfills from polyfill.io
    polyfillScript.src = '@Polyfillio.url';
    polyfillScript.onerror = function () { // if something goes wrong...
        // 1. ignore this script
        disableScript(polyfillScript);
        // 2. cancel the timeout that would have loaded the fallback eventually
        window.clearTimeout(window.guardian.loadPolyfillioFallback);
        // 3. manually load the fallback
        loadFallback();
    };
    polyfillScript.onload = function () { // once we get polyfills from polyfill.io...
        // 1. cancel the timeout that would have loaded the fallback eventually
        window.clearTimeout(window.guardian.loadPolyfillioFallback);
        // 2. disable the fallback script
        // why? it's possible this script took too long to arrive and the fallback
        // was triggered, but then this actually arrived *before* the fallback did.
        // in that case, we might as well use this instead of waiting, but we don't
        // want to patch again with the fallback when it arrives.
        disableScript(fallbackScript);
    };
    appScript.parentNode.insertBefore(polyfillScript, appScript);

    // give pollyfill.io 3 seconds to arrive before we trigger the fallback
    window.guardian.loadPolyfillioFallback = window.setTimeout(loadFallback, 3000);
})(document, window);
