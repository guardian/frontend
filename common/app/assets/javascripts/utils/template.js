define(function() {

    return function template(tmpl, params) {
        return Object.keys(params).reduce(function(tmpl, token) {
            return tmpl.replace('{{' + token + '}}', params[token]);
        }, tmpl);
    };

});
