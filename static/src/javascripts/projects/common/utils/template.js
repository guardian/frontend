define([
    'lodash/objects/keys'
], function (
    keys
) {
    return function template(template, params) {
        var regEx = new RegExp("({{)(" + keys(params).join("|") + ")(}})", "g");
        return template.replace(regEx, function(match, openingDelimiter, key, closingDelimiter) {
            return params[key];
        });
    };
});
