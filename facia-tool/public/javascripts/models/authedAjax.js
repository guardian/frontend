define([], function () {
    return function (opts) {

        return $.ajax(
            _.extend({}, opts, {dataType: 'json', contentType: 'application/json'})
        ).fail(function(xhr) {
            if (xhr.status === 403) {
                window.location.href = '/logout';
            }
        }).then(function(data) {
            return data;
        });
    }
});
