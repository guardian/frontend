define(['utils/url-abs-path'], function(urlAbsPath) {
    return {
        generateId: function () {
            return 'snap/' + new Date().getTime();
        },

        validateId: function (id) {
            return [].concat(urlAbsPath(id || '').match(/^snap\/\d+$/))[0] || undefined;
        }
    };
});
