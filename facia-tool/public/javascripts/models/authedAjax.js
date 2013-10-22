define([], function () {
    return function (opts) {
        return $.ajax(
            _.extend({}, opts, {
                dataType: 'json',
                contentType: 'application/json',
                cache: false
            })
        ).fail(function(xhr) {
            if (xhr.status === 403) {
                window.location.href = window.location.href;
            }
        }).then(function(data) {
            return data;
        });
    };
});
