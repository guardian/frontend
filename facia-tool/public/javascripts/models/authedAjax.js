define([], function () {
    return function (opts, callback) {
        $.ajax(opts)
        .always(function(data, status, xhr) {
            console.log(arguments);
            if (xhr.status === 403) {
                window.location.href = '/logout';
                return;
            }
            if (_.isFunction(callback)) {
                callback(data);
            }
        });
    }
});
