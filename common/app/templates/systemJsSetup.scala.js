@()

@JavaScript(Static.js.systemJsPolyfills)
// Temporary fix for URL polyfill in old browsers, i.e. Mobile Safari 7
// As per https://github.com/systemjs/systemjs/issues/548
// This will be removed when the fix has been released
try {
    if (new URL('test:///').protocol != 'test:') {
        URL = URLPolyfill;
    }
}
catch (e) {
    URL = URLPolyfill;
}
@JavaScript(Static.js.systemJs)

System.config({
    baseURL: '@{JavaScript(Configuration.assets.path)}',
    paths: {
        'ophan/ng': '@{JavaScript(Configuration.javascript.config("ophanJsUrl"))}.js',
        // .js must be added: https://github.com/systemjs/systemjs/issues/528
        'googletag.js': '@{JavaScript(Configuration.javascript.config("googletagJsUrl"))}'
    }
});

@JavaScript(Static.js.systemJsAppConfig)

@if(!play.Play.isDev()) {
    @JavaScript(Static.js.systemJsBundleConfig)
}

@JavaScript(Static.js.systemJsNormalize)

window.require = System.amdRequire.bind(System);
window.define = System.amdDefine.bind(System);
