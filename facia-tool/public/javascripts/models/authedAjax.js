define([
    'models/common'
], function (
    common
) {

    function request(opts) {
        return $.ajax(
            _.extend({}, opts, {dataType: 'json', contentType: 'application/json'})
        ).fail(function(xhr) {
            if (xhr.status === 403) {
                window.location.href = window.location.href;
            }
        }).then(function(data) {
            return data;
        });
    };

    function updateCollection(method, collection, data) {
        return request({
            url: common.config.apiBase + '/collection/' + collection.id,
            type: method,
            data: JSON.stringify(data)
        }).fail(function(xhr) {
            window.console.log(['Failed', method.toUpperCase(), ":", xhr.status, xhr.statusText, JSON.stringify(data)].join(' '));
        }).always(function() {
            collection.load();
        });
    };

    return {
        request: request,
        updateCollection: updateCollection
    }
});
