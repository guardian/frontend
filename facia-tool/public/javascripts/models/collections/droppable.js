/* global _: true */
define([
    'bindings/droppable',
    'modules/vars',
    'modules/authed-ajax',
    'modules/content-api',
    'models/collections/article',
    'utils/clean-clone',
    'utils/remove-by-id'
], function(
    droppable,
    vars,
    authedAjax,
    contentApi,
    Article,
    cleanClone,
    removeById
) {
    function init() {
        droppable({

            newItemsConstructor: function (id, sourceItem, targetList) {
                var items = [sourceItem || { id: id }];

                if(sourceItem && sourceItem.meta && sourceItem.meta.supporting) {
                    items = items.concat(sourceItem.meta.supporting);
                }

                return _.map(items, function(item) {
                    return new Article({
                        id: item.id,
                        meta: cleanClone(item.meta),
                        parent: targetList.parent,
                        parentType: targetList.parentType
                    });
                });
            },

            newItemsValidator: function(newItems) {
                return contentApi.validateItem(newItems[0]);
            },

            newItemsPersister: function(newItems, sourceItem, sourceList, targetList, id, position, isAfter) {
                var itemMeta,
                    timestamp,
                    supporting,
                    edits = {};

                if (targetList.parentType === 'Article') {
                    supporting = targetList.parent.meta.supporting.items;
                    _.each(newItems.slice(1), function(item) {
                        supporting.remove(function (supp) { return supp.id === item.id; });
                        supporting.push(item);
                    });
                    contentApi.decorateItems(supporting());
                    targetList.parent.save();
                    return;
                }

                if (targetList.parentType !== 'Collection') {
                    return;
                }

                targetList.parent.closeAllArticles();

                itemMeta = sourceItem && sourceItem.meta ? sourceItem.meta : {};

                if (targetList.parent.groups && targetList.parent.groups.length > 1) {
                    itemMeta.group = targetList.group + '';
                } else {
                    delete itemMeta.group;
                }

                timestamp = Math.floor(new Date().getTime()/1000);
                itemMeta.updatedAt = itemMeta.updatedAt ? itemMeta.updatedAt + ',' + timestamp : timestamp + ':f90'; // orange for the initial flag

                edits.update = {
                    collection: targetList.parent,
                    item:     id,
                    position: position,
                    after:    isAfter,
                    live:     vars.state.liveMode(),
                    draft:   !vars.state.liveMode(),
                    itemMeta: _.isEmpty(itemMeta) ? undefined : itemMeta
                };

                // Is a delete also required?
                if (sourceList &&
                    sourceList.parentType === 'Collection' &&
                    sourceList.parent.id !== targetList.parent.id  &&
                   !sourceList.keepCopy) {

                    removeById(sourceList.items, id);

                    edits.remove = {
                        collection: sourceList.parent,
                        id:     sourceList.parent.id,
                        item:   id,
                        live:   vars.state.liveMode(),
                        draft: !vars.state.liveMode()
                    };
                }

                authedAjax.updateCollections(edits);
            }
        });
    }

    return {
        init: _.once(init)
    };
});
