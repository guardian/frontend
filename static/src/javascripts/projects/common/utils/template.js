define([
    'common/utils/_'
], function (
    _
) {

    return function (string, data, options) {
        return _.template(string, options)(data);
    };

});
