define(function () {
    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources.
     */
    var assign = 'assign' in Object ? assignNative : assignPolyfill;
    return assign;

    function assignNative() {
        return Object.assign.apply(undefined, arguments);
    }

    function assignPolyfill(target) {
        for (var i = 1, ii = arguments.length; i < ii; i++) {
            var source = arguments[i];
            if (source) {
                Object.keys(source).forEach(function (key) {
                    target[key] = source[key];
                });
            }
        }
        return target;
    }
});
