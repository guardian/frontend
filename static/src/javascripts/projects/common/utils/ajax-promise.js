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
                var error = err ? err : new Error(text);

                var statusText = (err && err.statusText) || '';
                var statusCode = (err && err.status) || '';
                raven.captureException('Error retrieving data (' + text + ') (Status: ' + statusCode + ') (StatusText: ' + statusText + ')');

                error.request = request;
                reject(error);
            });
        });
        return promise;
    };
});
