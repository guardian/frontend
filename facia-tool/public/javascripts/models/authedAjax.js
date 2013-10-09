define([], function () {
    return function (opts) {
        opts.dataType = 'json';
        opts.contentType = 'application/json';

        var promise = $.ajax(opts)
            .fail(function(xhr) {
                if (xhr.status === 403) {
                    window.location.href = '/logout';
                }
            })
            .then(function(data) {
                return data;
            });

        return promise;
    }
});
