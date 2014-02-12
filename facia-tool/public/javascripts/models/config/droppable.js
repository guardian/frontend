/* global _: true */
define([
    'bindings/droppable',
    'modules/vars',
    'utils/remove-by-id',
    'utils/find-first-by-id'
], function(
    droppable,
    vars,
    removeById,
    findFirstById
) {
    function init() {
        droppable({
            newItemConstructor: function(id) {
                return findFirstById(vars.model.collections, id);
            },

            newItemValidator: function(newItem) {
                var defer = $.Deferred();

                defer[newItem? 'resolve' : 'reject']();

                return defer.promise();
            },

            newItemPersister: function(newItem, sourceItem, sourceList, targetList, id, position, isAfter) {

                // Move the collection with same id as the front itself to the TOP of list.
                targetList.items.unshift(removeById(targetList.items, targetList.parent.id));

                if (newItem.parents.indexOf(targetList.parent) < 0) {
                    newItem.parents.push(targetList.parent);
                }

                vars.model.save();
            }
        });
    }

    return {
        init: _.once(init)
    };
});
