define([
    'Promise'
], function (Promise) {
    return loadScript;

    function loadScript(props, attrs) {
        return new Promise(function (resolve) {
            if (props && props.id && document.getElementById(props.id)) {
                resolve();
            }
            var ref = document.scripts[0];
            var script = document.createElement('script');
            if (props) {
                Object.keys(props).forEach(function (prop) {
                    script[prop] = props[prop];
                });
            }
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
