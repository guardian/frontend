/* global _: true */
define([
    'bindings/droppable',
    'modules/vars',
    'utils/find-first-by-id'
], function(
    droppable,
    vars,
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

                var data = {
                    id: this.id,
                    collections: _.map(targetList.items(), function(item) { return item.id; })
                };
                // requires API endpoint
            }
        });
    }

    return {
        init: _.once(init)
    };
});
