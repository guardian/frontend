define([
    'models/common'
], function (
    common
) {

    function request(opts) {
        return $.ajax(
            _.extend({}, {dataType: 'json', contentType: 'application/json'}, opts)
        ).fail(function(xhr) {
            if (xhr.status === 403) {
                window.location.href = window.location.href;
            }
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
