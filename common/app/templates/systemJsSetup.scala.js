@()

@JavaScript(Static.systemJs.polyfills)
@JavaScript(Static.systemJs.main)

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

@JavaScript(Static.systemJs.appConfig)

@if(!play.Play.isDev()) {
    System.config({ bundles: @JavaScript(Static.systemJs.bundleConfig) });
}

@JavaScript(Static.systemJs.normalize)

window.require = System.amdRequire;
window.define = System.amdDefine;
