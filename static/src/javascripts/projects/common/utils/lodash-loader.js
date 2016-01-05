define([
    'module',
    'lodash/utilities/template'
], function (module, template) {
    var config = (module.config && module.config()) || {};
    var exports = {};
    var get;

    /** Thanks James Burke: https://github.com/requirejs/text/blob/master/text.js */
    function createXhr() {
        return new XMLHttpRequest();
    }

    if (config.env === 'node' || (!masterConfig.env &&
        typeof process !== "undefined" &&
        process.versions &&
        !!process.versions.node &&
        !process.versions['node-webkit'] &&
        !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        var fs = require.nodeRequire('fs');

        get = function (url, callback, errback) {
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
        };
    } else {
        get = function (url, callback, errback, headers) {
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

            var xhr = createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            xhr.onreadystatechange = onReadyStateChange;
            xhr.send(null);
        };
    }

    function load(name, req, onload) {
        function onSuccess(content) {
            try {
                onload(template(content));
            } catch (error) {
                onload.error(error);
            }
        }

        function onError(error) {
            onload.error(error);
        }

        var url = req.toUrl(name);
        get(url, onSuccess, onError);
    }

    exports.load = load;

    return exports;
});
