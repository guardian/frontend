define([
    'Promise'
], function (Promise) {
    return loadScript;

    function loadScript(src, attrs) {
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
            if (attrs) {
                Object.keys(attrs).forEach(function (attr) {
                    script.setAttribute(attr, attrs[attr]);
                });
            }
            script.onload = resolve;
            ref.parentNode.insertBefore(script, ref);
        });
    }
});
