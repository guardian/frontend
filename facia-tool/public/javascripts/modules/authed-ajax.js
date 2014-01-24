/* global _: true */
define(['modules/vars'], function(vars) {
    function request(opts) {
        return $.ajax(
            _.extend({}, {
                dataType: !opts.type || opts.type === 'get' ? 'json' : undefined,
                contentType: opts.data ? 'application/json' : undefined
            }, opts)
        ).fail(function(xhr) {
            if (xhr.status === 403) {
                window.location.href = window.location.href;
            }
        });
    }

    function updateCollection(edits, collections) {
        _.each(collections, function(collection) {
            collection.setPending(true);
        });

        return request({
            url: vars.CONST.apiBase + '/edits',
            type: 'POST',
            data: JSON.stringify(edits)
        }).fail(function(xhr) {
            window.console.log(['Failed: ', xhr.status, xhr.statusText, JSON.stringify(edits)].join(' '));
        }).always(function() {
            _.each(collections, function(collection) {
                collection.load();
            });
        });
    }

    return {
        request: request,
        updateCollection: updateCollection
    };
});
