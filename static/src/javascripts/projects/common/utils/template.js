define([
    'common/utils/_'
], function (
    _
) {

    return function template(tmpl, params) {
        return _.reduce(_.keys(params), function (tmpl, token) {
            return tmpl.replace(new RegExp('{{' + token + '}}', 'g'), params[token]);
        }, tmpl);
    };

});
