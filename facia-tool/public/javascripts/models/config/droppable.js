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

                if (newItem.parents.indexOf(targetList.parent) < 0) {
                    newItem.parents.push(targetList.parent);
                }

                vars.model.save(newItem);
            }
        });
    }

    return {
        init: _.once(init)
    };
});
