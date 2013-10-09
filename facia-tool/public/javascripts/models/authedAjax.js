define([], function () {
    return function (opts) {
        opts.dataType = 'json';
        opts.contentType = 'application/json';

        return $.ajax(opts).then(function(data, status, xhr) {
            if (xhr.status === 403) {
                window.location.href = '/logout';
            }
            return data;
        });
    }
});
