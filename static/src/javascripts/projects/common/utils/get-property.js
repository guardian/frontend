define([
    'common/utils/_'
], function (
    _
) {

    return function (object, property, defaultValue) {
        var value = _.reduce(property.split('.'), function (object, property) {
            return _.has(object, property) ? object[property] : undefined;
        }, object);

        return value !== undefined ? value : (defaultValue !== undefined) ? defaultValue : false;
    };

});
