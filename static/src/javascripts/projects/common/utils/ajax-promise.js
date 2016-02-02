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
        return new Promise(function (resolve, reject) {
            ajax(params)
                .then(resolve)
                .fail(function (res, msg, err) {
                    if (err) {
                        return reject(err);
                    }

                    if (res && res.status) {
                        var message = 'AJAX error (' + params.url + '): ' + res.statusText || '' + ' (' + res.status + ')';
                        return reject(new Error(message));
                    }

                    reject(new Error('Unknown AJAX error (' + params.url + ')'));
                });
        });
    };
});
