define([
    'lodash/collections/reduce',
    'lodash/objects/keys'
], function (
    reduce,
    keys
) {

    return function template(tmpl, params) {
        return reduce(keys(params), function (tmpl, token) {
            return tmpl.replace(new RegExp('{{' + token + '}}', 'g'), params[token]);
        }, tmpl);
    };

});
