@()

@JavaScript(Static.js.systemJsPolyfills)
@JavaScript(Static.js.systemJs)

System.config({
    baseURL: '@{JavaScript(Configuration.assets.path)}',
    paths: {
        'ophan/ng': '@{JavaScript(Configuration.javascript.config("ophanJsUrl"))}.js',
        'googletag': '@{JavaScript(Configuration.javascript.config("googletagJsUrl"))}'
    }
});

@JavaScript(Static.js.systemJsAppConfig)

@if(!play.Play.isDev()) {
    @JavaScript(Static.js.systemJsBundleConfig)
}

@JavaScript(Static.js.systemJsNormalize)

window.require = System.amdRequire.bind(System);
window.define = System.amdDefine.bind(System);
