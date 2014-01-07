define(['modules/vars', 'lodash/objects/assign'], function(vars, assign) {
    function request(opts) {
        return $.ajax(
            assign({}, {
                dataType: !opts.type || opts.type === 'get' ? 'json' : undefined,
                contentType: 'application/json'
            }, opts)
        ).fail(function(xhr) {
            if (xhr.status === 403) {
                window.location.href = window.location.href;
            }
        });
    }

    function updateCollection(method, collection, data) {
        collection.state.loadIsPending(true);

        return request({
            url: vars.CONST.apiBase + '/collection/' + collection.id,
            type: method,
            data: JSON.stringify(data)
        }).fail(function(xhr) {
            window.console.log(['Failed', method.toUpperCase(), ":", xhr.status, xhr.statusText, JSON.stringify(data)].join(' '));
        }).always(function() {
            collection.load();
        });
    }

    return {
        request: request,
        updateCollection: updateCollection
    };
});
