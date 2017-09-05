// @flow

// includes:
// - https://meyerweb.com/eric/tools/css/reset
// - https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice

import resetCSS from './reset.css';
import fontsCSS from './fonts.css';
import loadApp from 'raw-loader!./loadApp.js';

export default (props: any, css: string) =>
    `<head lang="en" data-page-path="/uk">
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Page not found | The Guardian</title>
        <meta name="description" content="">
        <meta name="format-detection" content="telephone=no"/>
        <meta name="HandheldFriendly" content="True"/>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>${resetCSS}</style>
        <style>${fontsCSS}</style>
        ${css}
        <script>window.guardian = ${JSON.stringify(props)};</script>
        <script>
            // the app is bundled without any polyfills. babel transpiles the syntax
            // to es5 but we do not provide any polyfills for missing methods.
            // for that, we use polyfill.io.
            //
            // since that's a possbile point of failure, we have a checked-in copy of
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
                } catch (e) {};
            }

            // Load the app and try to patch the env with polyfill.io
            // Adapted from https://www.html5rocks.com/en/tutorials/speed/script-loading/#toc-aggressive-optimisation
            (function (document, window) {
                var src;
                var script;
                var pendingScripts = [];
                var firstScript = document.scripts[0];
                var scripts = [
                    '${props.polyfillioUrl}',
                    '${props.bundleUrl}'
                ];

                function stateChange() {
                    var pendingScript;
                    while (pendingScripts[0] && pendingScripts[0].readyState == 'loaded') {
                        pendingScript = pendingScripts.shift();
                        pendingScript.onreadystatechange = null;
                        firstScript.parentNode.insertBefore(pendingScript, firstScript);
                    }
                }

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
            })(document, window);
        </script>
    </head>`;
