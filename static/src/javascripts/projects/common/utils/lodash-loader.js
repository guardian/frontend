define([
    'module',
    'lodash/utilities/template'
], function (module, template) {
    var exports = {};
    var buildMap = {};

    /** Thanks James Burke: https://github.com/requirejs/text/blob/master/text.js */
    function createXhr() {
        return new XMLHttpRequest();
    }

    function getNode(url, callback, errback) {
        var fs = require.nodeRequire('fs');

        try {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file[0] === '\uFEFF') {
                file = file.substring(1);
            }
            callback(file);
        } catch (e) {
            if (errback) {
                errback(e);
            }
        }
    }

    function getWeb(url, callback, errback) {
        function onReadyStateChange() {
            var status, err;
            //Do not explicitly handle errors, those should be
            //visible via console output in the browser.
            if (xhr.readyState === 4) {
                status = xhr.status || 0;
                if (status > 399 && status < 600) {
                    //An http 4xx or 5xx error. Signal an error.
                    err = new Error(url + ' HTTP status: ' + status);
                    err.xhr = xhr;
                    if (errback) {
                        errback(err);
                    }
                } else {
                    callback(xhr.responseText);
                }
            }
        }

        var xhr = createXhr();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = onReadyStateChange;
        xhr.send(null);
    }

    function load(name, req, onload, config) {
        function onSuccess(content) {
            try {
                var fn = template(content);
                if (config.isBuild) {
                    buildMap[name] = fn.source;
                }
                onload(fn);
            } catch (error) {
                onload.error(error);
            }
        }

        function onError(error) {
            onload.error(error);
        }

        var url = req.toUrl(name);
        if (config.isBuild) {
            getNode(url, onSuccess, onError);
        } else {
            getWeb(url, onSuccess, onError);
        }
    }

    function write(pluginName, moduleName, write) {
        if (buildMap.hasOwnProperty(moduleName)) {
            var content = buildMap[moduleName];
            write.asModule(
                pluginName + '!' + moduleName,
                'define(["lodash/utilities/escape"], function(e) {\n' +
                'var _ = { escape: e };\n' +
                'return ' + content + ';\n' +
                '});\n'
            );
        }
    }

    exports.load = load;
    exports.write = write;

    return exports;
});
