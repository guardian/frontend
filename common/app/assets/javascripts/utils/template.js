define(function() {

    return function template(tmpl, params) {
        return Object.keys(params).reduce(function(tmpl, token) {
            return tmpl.replace(new RegExp('{{' + token + '}}', 'g'), params[token]);
        }, tmpl);
    };

});
