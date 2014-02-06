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

                if(newItem) {
                    defer.resolve();
                } else {
                    defer.reject();
                }

                return defer.promise();
            },

            newItemPersister: function(sourceItem, sourceList, targetList, id, position, isAfter) {
                var data = {
                    id: this.id,
                    collections: _.map(targetList.items(), function(item) { return item.id; })
                };
                // requires API endpoint
                //console.log(data);
            }
        });
    }

    return {
        init: _.once(init)
    };
});
