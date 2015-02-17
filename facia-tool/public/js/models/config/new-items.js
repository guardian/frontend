define([
    'jquery',
    'modules/vars',
    'utils/url-abs-path',
    'utils/find-first-by-id'
], function(
    $,
    vars,
    urlAbsPath,
    findFirstById
) {
    return {
        newItemsConstructor: function(id) {
            return [findFirstById(vars.model.collections, urlAbsPath(id))];
        },

        newItemsValidator: function(newItems) {
            var defer = $.Deferred();

            defer[newItems[0]? 'resolve' : 'reject']();

            return defer.promise();
        },

        newItemsPersister: function(newItems, sourceContext, sourceGroup, targetContext, targetGroup) {
            if (newItems[0].parents.indexOf(targetGroup.parent) < 0) {
                newItems[0].parents.push(targetGroup.parent);
            }

            targetGroup.parent.saveProps();
        }
    };
});
