define(function () {

    return function (object, property, defaultValue) {
        var value = property.split('.').reduce(function (object, property) {
            return object && object.hasOwnProperty(property) ? object[property] : undefined;
        }, object);

        return value !== undefined ? value : (defaultValue !== undefined) ? defaultValue : false;
    };

});
