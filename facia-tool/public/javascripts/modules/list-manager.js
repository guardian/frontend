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

        id
        sourceItem
        sourceList (optional)

        targetItem (optional)
        targetList

        isAfter (optional)
    */
    function listManager(opts) {
        var position,
            newItems,
            insertAt;

        position = opts.targetItem && _.isFunction(opts.targetItem.id) ? opts.targetItem.id() : undefined;

        removeById(opts.targetList.items, urlAbsPath(opts.id));

        insertAt = opts.targetList.items().indexOf(opts.targetItem) + (opts.isAfter || 0);
        insertAt = insertAt === -1 ? opts.targetList.items().length : insertAt;

        newItems = opts.newItemsConstructor(opts.id, opts.sourceItem, opts.targetList);

        if (!newItems[0]) {
            alertBadContent(opts.id, null);
            return;
        }

        opts.targetList.items.splice(insertAt, 0, newItems[0]);

        opts.newItemsValidator(newItems)
        .fail(function(err) {
            _.each(newItems, function(item) { opts.targetList.items.remove(item); });
            alertBadContent(opts.id, err);
        })
        .done(function() {
            if (_.isFunction(opts.targetList.reflow)) {
                opts.targetList.reflow();
            }

            if (!opts.targetList.parent) {
                return;
            }

            opts.newItemsPersister(newItems, opts.sourceList, opts.targetList, position, opts.isAfter);
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
