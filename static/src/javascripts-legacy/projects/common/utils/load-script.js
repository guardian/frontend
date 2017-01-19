define([
    'Promise',
    'common/utils/assign'
], function (Promise, assign) {
    return loadScript;

    function loadScript(src, props) {
        if (typeof src !== 'string') {
            return new Promise.reject('no src supplied');
        }
        return new Promise(function (resolve) {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve();
            }
            var ref = document.scripts[0];
            var script = document.createElement('script');
            script.src = src;
            if (props) {
                assign(script, props);
            }
            script.onload = resolve;
            ref.parentNode.insertBefore(script, ref);
        });
    }
});
