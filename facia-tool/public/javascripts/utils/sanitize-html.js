/* global _: true */
define(function() {
    return function(s) {
        var el,
            scripts;

        if (_.isString(s)) {
            el = document.createElement('div');
            el.innerHTML = s;

            scripts = el.getElementsByTagName("script");
            Array.prototype.forEach.call(scripts, function(script) {
                script.parentElement.removeChild(script);
            });

            return el.innerHTML;
        } else {
            return s;
        }
    };
});
