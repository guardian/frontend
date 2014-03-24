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
                window.location.reload(true);
            }
        });
    }

    function updateCollections(edits) {
        var collections = [];

        _.each(edits, function(edit) {
            if(_.isObject(edit)) {
                edit.collection.setPending(true);
                edit.id = edit.collection.id;
                collections.push(edit.collection);
                delete edit.collection;
            }
        });

        return request({
            url: vars.CONST.apiBase + '/edits',
            type: 'POST',
            data: JSON.stringify(edits)
        }).fail(function() {
            _.each(collections, function(collection) { collection.load(); });
        }).done(function(resp) {
            _.each(collections, function(collection) { collection.populate(resp[collection.id]); });
        });
    }

    return {
        request: request,
        updateCollections: updateCollections
    };
});
