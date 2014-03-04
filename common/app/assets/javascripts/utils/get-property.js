define(['lodash/objects/has'], function (has) {

    return function (object, property, defaultValue) {
        var value = property.split('.').reduce(function(object, property) {
            return (has(object, property)) ? object[property] : undefined;
        }, object);
        return value !== undefined ? value : (defaultValue !== undefined) ? defaultValue : false;
    };

});
