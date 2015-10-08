@(item: model.MetaData, curlPaths: Map[String, String] = Map())

// systemJS
@JavaScript(Static.systemJs.polyfills)
@JavaScript(Static.systemJs.main)

// CONFIG
System.config({
    defaultJSExtensions: true,
    baseURL: '/',
    paths: {
        @curlPaths.map { case (module, path) =>
            '@module': '@Static(path)',
        }
        core:                     '@Static("javascripts/core.js")',
        'facebook.js':              '//connect.facebook.net/en_US/all.js',
        'foresee.js':               'vendor/foresee/20150703/foresee-trigger.js',
        'googletag.js':             '@{Configuration.javascript.config("googletagJsUrl")}',
        'ophan/ng':                 '@{Configuration.javascript.config("ophanJsUrl")}',
        stripe:                     '@Static("javascripts/vendor/stripe/stripe.min.js")',
        text:                       'text', // noop
        inlineSvg:                  'inlineSvg', // noop
        zxcvbn:                     '@Static("javascripts/components/zxcvbn/zxcvbn.js")',
        'bootstraps/accessibility': '@Static("javascripts/bootstraps/accessibility.js")',
        'bootstraps/app':           '@Static("javascripts/bootstraps/app.js")',
        'bootstraps/commercial':    '@Static("javascripts/bootstraps/commercial.js")',
        'bootstraps/creatives':     '@Static("javascripts/bootstraps/creatives.js")',
        'bootstraps/dev':           '@Static("javascripts/bootstraps/dev.js")',
        'bootstraps/preferences':   '@Static("javascripts/bootstraps/preferences.js")',
        @if(item.isFront) {
            'bootstraps/facia':         '@Static("javascripts/bootstraps/facia.js")',
        }
        'bootstraps/football':      '@Static("javascripts/bootstraps/football.js")',
        'bootstraps/image-content': '@Static("javascripts/bootstraps/image-content.js")',
        'bootstraps/membership':    '@Static("javascripts/bootstraps/membership.js")',
        'bootstraps/sudoku':        '@Static("javascripts/bootstraps/sudoku.js")',
        'bootstraps/video-player':  '@Static("javascripts/bootstraps/video-player.js")',
        'bootstraps/article':         '@Static("javascripts/bootstraps/article.js")',
        'bootstraps/liveblog': '@Static("javascripts/bootstraps/liveblog.js")',
        'bootstraps/trail': '@Static("javascripts/bootstraps/trail.js")',
        'bootstraps/gallery': '@Static("javascripts/bootstraps/gallery.js")',
        'bootstraps/profile': '@Static("javascripts/bootstraps/profile.js")'
    },
    meta: {
        '*': {
            scriptLoad: true
        }
    }
});

System.define('system-script', 'exports.fetch=function(a){console.info("passing ", a, " through system-script");return new Promise(function(b,c){function f(a){e.readyState&&"loaded"!==e.readyState&&"complete"!=e.readyState||(h(),b(""))}function g(a){h(),c(a)}function h(){e.detachEvent?e.detachEvent("onreadystatechange",f):(e.removeEventListener("load",f,!1),e.removeEventListener("error",g,!1)),d.removeChild(e)}var d=document.getElementsByTagName("head")[0],e=document.createElement("script");e.async=!0,e.attachEvent?e.attachEvent("onreadystatechange",f):(e.addEventListener("load",f,!1),e.addEventListener("error",g,!1)),e.src=a.address,d.appendChild(e)})};');
var reduce = function (array, fn, accumulator) {
    for (var i = 0; i <= array.length - 1; i++) {
        accumulator = fn(accumulator, array[i]);
    }
    return accumulator;
};

(function () {
    var systemNormalize = System.normalize;
    System.normalize = function (name, parentName) {
        var requireToSystemPluginMap = {
            'js': 'system-script'
        };
        var transformers = [
            function reversePluginFormat(name) {
                var destructuredName = /(.+?)!(.+)/.exec(name);

                if (destructuredName) {
                    var pluginName = destructuredName[1];
                    var moduleId = destructuredName[2];
                    var newPluginName = requireToSystemPluginMap[pluginName];
                    var reversedName = moduleId + '!' + newPluginName;

                    return newPluginName ? reversedName : name;
                } else {
                    return name;
                }
            }
        ];

        var newName = reduce(transformers, function (name, fn) {
            return fn(name);
        }, name);

        return systemNormalize.call(this, newName, parentName);
    };
})();

window.require = window.requirejs = System.amdRequire;
window.define = System.amdDefine;
