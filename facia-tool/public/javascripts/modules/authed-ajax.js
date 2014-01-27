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

    function updateCollections(edits, collections) {
        _.each(collections, function(collection) {
            collection.setPending(true);
        });

        return request({
            url: vars.CONST.apiBase + '/edits',
            type: 'POST',
            data: JSON.stringify(edits)
        }).fail(function(xhr) {
            _.each(collections, function(collection) {
                collection.load();
            });
            window.console.log(['Failed: ', xhr.status, xhr.statusText, JSON.stringify(edits)].join(' '));
        }).done(function(resp) {
            _.each(collections, function(collection) {
                collection.populate(resp[collection.id]);
            });
        });
    }

    return {
        request: request,
        updateCollections: updateCollections
    };
});
