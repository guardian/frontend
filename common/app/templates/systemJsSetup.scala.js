@()

@JavaScript(Static.js.es6ModuleLoader)
@JavaScript(Static.js.systemJs)
@JavaScript(Static.js.systemJsAppConfig)

@if(!play.Play.isDev()) {
    @JavaScript(Static.js.systemJsBundleConfig)
}

System.baseURL = '@{JavaScript(Configuration.assets.path)}';
System.paths['ophan/ng']  = '@{JavaScript(Configuration.javascript.config("ophanJsUrl"))}.js';
System.paths['googletag'] = '@{JavaScript(Configuration.javascript.config("googletagJsUrl"))}';

@JavaScript(Static.js.systemJsNormalize)

window.require = System.amdRequire.bind(System);
window.define = System.amdDefine.bind(System);
