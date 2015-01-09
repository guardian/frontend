/* global _: true */
define(['modules/vars'], function(vars) {
    function request(opts) {
        return $.ajax(
            _.extend({}, {
                dataType: !opts.type ? 'json' : undefined,
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

        edits.type = [
            edits.update ? 'Update' : null,
            edits.remove ? 'Remove' : null
        ].filter(function(s) { return s; }).join('And');

        return request({
            url: collectionEndPoint(edits),
            type: 'POST',
            data: JSON.stringify(edits)
        }).fail(function() {
            _.each(collections, function(collection) { collection.load(); });
        }).done(function(resp) {
            _.each(collections, function(collection) { collection.populate(resp[collection.id]); });
        });
    }

    function collectionEndPoint (edits) {
        if ((edits.update || edits.remove).mode === 'treats') {
            return vars.CONST.apiBase + '/treats/' + (edits.update || edits.remove).id;
        } else {
            return vars.CONST.apiBase + '/edits';
        }
    }

    return {
        request: request,
        updateCollections: updateCollections
    };
});
