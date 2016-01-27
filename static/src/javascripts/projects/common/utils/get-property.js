define([
    'lodash/collections/reduce',
    'lodash/objects/has'
], function (
    reduce,
    has
) {

    return function (object, property, defaultValue) {
        var value = reduce(property.split('.'), function (object, property) {
            return has(object, property) ? object[property] : undefined;
        }, object);

        return value !== undefined ? value : (defaultValue !== undefined) ? defaultValue : false;
    };

});
