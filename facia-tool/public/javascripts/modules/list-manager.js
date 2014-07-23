/* global _: true */
define([
    'utils/mediator',
    'utils/url-abs-path',
    'utils/remove-by-id'
], function(
    mediator,
    urlAbsPath,
    removeById
) {

    function alertBadContent(id, msg) {
        window.alert(msg ? msg + '. ' + id : 'Sorry, but you can\'t add' + (id ? ': ' + id : ' that'));
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
    */
    function listManager(opts) {
        var position,
            newItems,
            insertAt;

        position = opts.targetItem && _.isFunction(opts.targetItem.id) ? opts.targetItem.id() : undefined;

        removeById(opts.targetGroup.items, urlAbsPath(opts.sourceItem.id));

        insertAt = opts.targetGroup.items().indexOf(opts.targetItem) + (opts.isAfter || 0);
        insertAt = insertAt === -1 ? opts.targetGroup.items().length : insertAt;

        newItems = opts.newItemsConstructor(opts.sourceItem.id, opts.sourceItem, opts.targetGroup);

        if (!newItems[0]) {
            alertBadContent(opts.sourceItem.id, null);
            return;
        }

        opts.targetGroup.items.splice(insertAt, 0, newItems[0]);

        opts.newItemsValidator(newItems)
        .fail(function(err) {
            _.each(newItems, function(item) { opts.targetGroup.items.remove(item); });
            alertBadContent(opts.sourceItem.id, err);
        })
        .done(function() {
            if (_.isFunction(opts.targetGroup.reflow)) {
                opts.targetGroup.reflow();
            }

            if (!opts.targetGroup.parent) {
                return;
            }

            opts.newItemsPersister(newItems, opts.sourceGroup, opts.targetGroup, position, opts.isAfter);
        });
    }

    return {
        init: _.once(function(newItems) {
            mediator.on('collection:updates', function(opts) {
                listManager(_.extend(opts, newItems));
            });
        })
    };
});
