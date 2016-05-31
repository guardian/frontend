define(function () {
    var assign = 'assign' in Object ? assignNative : assignPolyfill;
    return assign;

    function assignNative() {
        return Object.assign.apply(undefined, arguments);
    }

    function assignPolyfill(target) {
        for (var i = 1, ii = arguments.length; i < ii; i++) {
            var source = arguments[i];
            Object.keys(source).forEach(function (key, index) {
                target[key] = source[key];
            });
        }
        return target;
    }
});
