/* global _: true */
define([
    'bindings/droppable',
    'models/collections/article',
    'utils/clean-clone'
], function(
    Droppable,
    Article,
    cleanClone
) {
    return function() {
        return new Droppable({
            itemConstructor: function (id, sourceItem, targetList) {
                return new Article({
                    id: id,
                    meta: sourceItem ? cleanClone(sourceItem.meta) : undefined,
                    parent: targetList.parent,
                    parentType: targetList.parentType
                });
            }
        });
    };
});
