define([
    'common/utils/ajax',
    'raven',
    'Promise'
], function (
    ajax,
    raven,
    Promise
) {
    return function wrappedAjax(params) {
        var promise = new Promise(function (resolve, reject) {
            ajax(params)
            .then(function (value) {
                resolve(value);
            })
            .fail(function (request, text, err) {
                var statusText = (err && err.statusText) || '';
                var statusCode = (err && err.status) || '';
                var errorText = 'Error retrieving data (' + text + ') (Status: ' + statusCode + ') (StatusText: ' + statusText + ')';

                var error = err ? err : new Error(errorText);

                error.request = request;
                reject(error);
            });
        });
        return promise;
    };
});
