@import conf.Static
@import conf.Configuration
@import conf.switches.Switches.{PolyfillIO, PolyfillIOFallbackMin}

@(bootModule: String = "standard")(implicit request: RequestHeader)

// the app is bundled without any polyfills. babel transpiles the syntax
// to es5 but we do not provide any polyfills for missing methods.
// for that, we use polyfill.io.
//
// since that's a possible point of failure, we have a checked-in copy of
// the pf.io response for *all* polyfills that we may serve to everyone
// as a worst-case back up. This fallback will be loaded if the PolyfillIO
// switch is off.
//
// in that situation, they're gated, meaning they won't patch if they don't
// need to, but they're still downloaded (currently ~20 kB gzipped) and
// the file is still parsed

// this is a global that's called at the bottom of the pf.io response,
// once the polyfills have run. This may be useful for debugging.
function guardianPolyfilled() {
    try {
        window.guardian.polyfilled = true;
        window.guardian.onPolyfilled();
    } catch (e) {};
}

// Load the app and try to patch the env with polyfill.io
// Adapted from https://www.html5rocks.com/en/tutorials/speed/script-loading/#toc-aggressive-optimisation
(function (document, window) {
    var src;
    var script;
    var pendingScripts = new window.Array();
    var firstScript = document.scripts[0];

    @defining(if(PolyfillIO.isSwitchedOn) {
      common.Assets.js.polyfillioUrl
    } else {
      Static("javascripts/vendor/polyfillio.fallback.js")
    }) { polyfillioUrl =>
        var scripts = new window.Array(
            '@polyfillioUrl',
            '@Static(s"javascripts/graun.$bootModule.js")'
        );
    }

    @if(PolyfillIOFallbackMin.isSwitchedOn) {
        scripts.unshift('@Static(s"javascripts/vendor/polyfillio.minimum.fallback.js")')
    }

    function stateChange() {
        var pendingScript = new window.Array();
        while (pendingScripts[0] && pendingScripts[0].readyState == 'loaded') {
            pendingScript = pendingScripts.shift();
            pendingScript.onreadystatechange = null;
            firstScript.parentNode.insertBefore(pendingScript, firstScript);
        }
    }

    if (window.location.hash !== '#nojs') {
        while (src = scripts.shift()) {
            if ('async' in firstScript) { // modern browsers
                script = document.createElement('script');
                script.async = false;
                script.src = src;
                document.head.appendChild(script);
            }
            else if (firstScript.readyState) { // IE<10
                script = document.createElement('script');
                pendingScripts.push(script);
                script.onreadystatechange = stateChange;
                script.src = src;
            }
            else { // fall back to defer
                document.write('<script src="' + src + '" defer></'+'script>');
            }
        }
    }
})(document, window);
