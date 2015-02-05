define([
    'common/utils/ajax',
    'Promise'
], function (
    ajax,
    Promise
) {
    return function wrappedAjax(params) {
        var promise = new Promise(function (resolve, reject) {
            ajax(params)
            .then(function (value) {
                resolve(value);
            })
            .fail(function (request, text, err) {
                var error = err ? err : new Error(text);
                error.request = request;
                reject(error);
            });
        });
        return promise;
    };
});
