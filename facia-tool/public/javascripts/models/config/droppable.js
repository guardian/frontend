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
            newItemsConstructor: function(id) {
                return [findFirstById(vars.model.collections, id)];
            },

            newItemsValidator: function(newItems) {
                var defer = $.Deferred();

                defer[newItems[0]? 'resolve' : 'reject']();

                return defer.promise();
            },

            newItemsPersister: function(newItems, sourceList, targetList) {
                if (newItems[0].parents.indexOf(targetList.parent) < 0) {
                    newItems[0].parents.push(targetList.parent);
                }

                vars.model.save(newItems[0]);
            }
        });
    }

    return {
        init: _.once(init)
    };
});
