define([
    'common/utils/_',
    'lodash/collections/reduce',
    'lodash/objects/has'
], function (
    _,
    reduce,
    has) {

    return function (object, property, defaultValue) {
        var value = reduce(property.split('.'), function (object, property) {
            return has(object, property) ? object[property] : undefined;
        }, object);

        return value !== undefined ? value : (defaultValue !== undefined) ? defaultValue : false;
    };

});
