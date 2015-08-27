@()

@JavaScript(Static.js.systemJsPolyfills)
@JavaScript(Static.js.systemJs)

var baseURL = '@{JavaScript(Configuration.assets.path)}';

// Force relative protocol for old IE (ajax requests must be targeted to the
// same scheme as the hosting page, point 7 at
// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx)
if (navigator.userAgent.match(/MSIE (8|9)\.0/)) {
    baseURL = baseURL.replace(/^https:/, '');
}

System.config({
    baseURL: baseURL,
    paths: {
        'ophan/ng': '@{JavaScript(Configuration.javascript.config("ophanJsUrl"))}.js',
        // .js must be added: https://github.com/systemjs/systemjs/issues/528
        'googletag.js': '@{JavaScript(Configuration.javascript.config("googletagJsUrl"))}'
    }
});

@JavaScript(Static.js.systemJsAppConfig)

@if(!play.Play.isDev()) {
    System.config({ bundles: @JavaScript(Static.js.systemJsBundleConfig) });
}

@JavaScript(Static.js.systemJsNormalize)

window.require = System.amdRequire;
window.define = System.amdDefine;
