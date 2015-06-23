// We use system.normalize to convert RequireJS module IDs to SystemJS module
// IDs. This is mainly necessary because the plugin format is reversed in
// SystemJS (suffix rather than prefix).

// Used in JavaScriptLaterSteps.scala.html and bundle.js
// IIFE is the only way to share this piece of code.
// If only we had a module loader to load the module loader.

// For older browsers
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
            // Bundled
            'text': 'text',
            'inlineSvg': 'svg',
            // Runtime
            'js': 'system-script'
        };
        var transformers = [
            function map(name) {
                // TODO: Source this from npm and use the module ID
                // "socketio", consistent with RequireJS. SystemJS will read
                // the package.json’s main property.
                if (name === 'socketio') {
                    return 'socketio/socket.io';
                } else {
                    return name;
                }
            },
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
