define([
    'underscore',
    'modules/vars',
    'utils/alert',
    'utils/mediator',
    'utils/url-abs-path',
    'utils/remove-by-id'
], function(
    _,
    vars,
    alert,
    mediator,
    urlAbsPath,
    removeById
) {

    function alertBadContent(msg) {
        alert(msg ? msg : 'Sorry, but you can\'t add that item');
    }

    /* opts:
        newItemsConstructor
        newItemsValidator
        newItemsPersister

        sourceItem
        sourceGroup (optional)

        targetItem (optional)
        targetGroup

        isAfter (optional)

        mediaItem (optional)
    */
    function listManager(opts) {
        var position,
            newItems,
            insertAt;

        if (opts.mediaItem) {
            if (_.isFunction(opts.mediaHandler)) {
                opts.mediaHandler(opts);
            } else {
                alertBadContent('Unhandled media item');
            }
            return;
        }

        position = opts.targetItem && _.isFunction(opts.targetItem.id) ? opts.targetItem.id() : undefined;

        removeById(opts.targetGroup.items, urlAbsPath(opts.sourceItem.id));

        insertAt = opts.targetGroup.items().indexOf(opts.targetItem) + (opts.isAfter || 0);
        insertAt = insertAt === -1 ? opts.targetGroup.items().length : insertAt;

        newItems = opts.newItemsConstructor(opts.sourceItem.id, opts.sourceItem, opts.targetGroup);

        if (!newItems[0]) {
            alertBadContent();
            return;
        }

        opts.targetGroup.items.splice(insertAt, 0, newItems[0]);

        opts.newItemsValidator(newItems, opts.targetContext)
        .fail(function(err) {
            _.each(newItems, function(item) { opts.targetGroup.items.remove(item); });
            alertBadContent(err);
        })
        .done(function() {
            if (opts.targetGroup.parent) {
                opts.newItemsPersister(newItems, opts.sourceContext, opts.sourceGroup, opts.targetContext, opts.targetGroup, position, opts.isAfter);
            }
        });
    }

    function alternateAction (opts) {
        if (opts.targetGroup.parentType === 'Article') {
            var id = urlAbsPath(opts.sourceItem.id);

            if (id.indexOf(vars.CONST.internalContentPrefix) !== 0) {
                return;
            }

            var newItems = opts.newItemsConstructor(urlAbsPath(id), null, opts.targetGroup);

            if (!newItems[0]) {
                alertBadContent();
                return;
            }

            opts.mergeItems(newItems[0], opts.targetGroup.parent, opts.targetContext);
        }
    }

    return {
        init: _.once(function(newItems) {
            mediator.on('collection:updates', function(opts) {
                var options = _.extend(opts, newItems);
                if (opts.alternateAction) {
                    alternateAction(options);
                } else {
                    listManager(options);
                }
            });
        })
    };
});
