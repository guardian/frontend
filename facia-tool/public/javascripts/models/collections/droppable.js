/* global _: true */
define([
    'bindings/droppable',
    'modules/vars',
    'modules/authed-ajax',
    'modules/content-api',
    'models/collections/article',
    'utils/clean-clone',
    'utils/deep-get',
    'utils/remove-by-id'
], function(
    droppable,
    vars,
    authedAjax,
    contentApi,
    Article,
    cleanClone,
    deepGet,
    removeById
) {
    function init() {
        droppable({

            newItemsConstructor: function (id, sourceItem, targetList) {
                var items = [_.extend(_.isObject(sourceItem) ? sourceItem : {}, { id: id })];

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

            newItemsPersister: function(newItems, sourceList, targetList, position, isAfter) {
                var id = newItems[0].id(),
                    itemMeta,
                    timestamp,
                    supporting,
                    remove;

                if (!targetList || !targetList.parent) { return; }

                if (targetList.parentType === 'Article') {
                    supporting = targetList.parent.meta.supporting.items;
                    _.each(newItems.slice(1), function(item) {
                        supporting.remove(function (supp) { return supp.id() === item.id(); });
                        supporting.push(item);
                    });
                    contentApi.decorateItems(supporting());
                    targetList.parent.save();

                    remove = remover(sourceList, id);
                    if (remove) {
                        authedAjax.updateCollections({remove: remove});
                        removeById(sourceList.items, id);
                    }
                }

                if (targetList.parentType === 'Collection') {
                    targetList.parent.closeAllArticles();
                    itemMeta = newItems[0].getMeta() || {};

                    if (deepGet(targetList, '.parent.groups.length') > 1) {
                        itemMeta.group = targetList.group + '';
                    } else {
                        delete itemMeta.group;
                    }

                    timestamp = Math.floor(new Date().getTime()/1000);
                    itemMeta.updatedAt = itemMeta.updatedAt ? itemMeta.updatedAt + ',' + timestamp : timestamp + ':fbcc43'; // yellow for the initial flag

                    remove = (deepGet(sourceList, '.parent.id') && deepGet(sourceList, '.parent.id') !== targetList.parent.id);
                    remove = remove ? remover(sourceList, id) : undefined;

                    authedAjax.updateCollections({
                        update: {
                            collection: targetList.parent,
                            item:     id,
                            position: position,
                            after:    isAfter,
                            live:     vars.state.liveMode(),
                            draft:   !vars.state.liveMode(),
                            itemMeta: _.isEmpty(itemMeta) ? undefined : itemMeta
                        },
                        remove: remove
                    })
                    .then(function() {
                        if(vars.state.liveMode()) {
                            vars.model.deferredDetectPressFailure();
                        }
                    });

                    if (sourceList && !sourceList.keepCopy && sourceList !== targetList) {
                        removeById(sourceList.items, id); // for immediate UI effect
                    }
                }
            }
        });
    }

    function remover(sourceList, id) {
        if (sourceList &&
            sourceList.parentType === 'Collection' &&
           !sourceList.keepCopy) {

            return {
                collection: sourceList.parent,
                id:     sourceList.parent.id,
                item:   id,
                live:   vars.state.liveMode(),
                draft: !vars.state.liveMode()
            };
        }
    }

    return {
        init: _.once(init)
    };
});
