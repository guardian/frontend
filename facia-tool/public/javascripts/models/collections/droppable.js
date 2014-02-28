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

            newItemConstructor: function (id, sourceItem, targetList) {
                return new Article({
                    id: id,
                    meta: sourceItem ? cleanClone(sourceItem.meta) : undefined,
                    parent: targetList.parent,
                    parentType: targetList.parentType
                });
            },

            newItemValidator: contentApi.validateItem,

            newItemPersister: function(newItem, sourceItem, sourceList, targetList, id, position, isAfter) {
                var itemMeta,
                    timestamp,
                    edits = {};

                if (targetList.parentType === 'Article') {
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
