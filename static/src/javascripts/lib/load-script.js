define([
    'Promise',
    'lodash/objects/assign'
], function (Promise, assign) {
    return loadScript;

    function loadScript(src, props) {
        if (typeof src !== 'string') {
            return Promise.reject('no src supplied');
        }

        if (document.querySelector('script[src="' + src + '"]')) {
            return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
            var ref = document.scripts[0];
            var script = document.createElement('script');
            script.src = src;
            if (props) {
                assign(script, props);
            }
            script.onload = resolve;
            script.onerror = reject;
            ref.parentNode.insertBefore(script, ref);
        });
    }
});
