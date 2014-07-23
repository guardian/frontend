/* global _: true */
define([
    'modules/vars',
    'modules/authed-ajax',
    'modules/content-api',
    'models/collections/article',
    'utils/clean-clone',
    'utils/deep-get',
    'utils/remove-by-id'
], function(
    vars,
    authedAjax,
    contentApi,
    Article,
    cleanClone,
    deepGet,
    removeById
) {

    function newItemsConstructor(id, sourceItem, targetGroup) {
        var items = [_.extend(_.isObject(sourceItem) ? sourceItem : {}, { id: id })];

        if(sourceItem && sourceItem.meta && sourceItem.meta.supporting) {
            items = items.concat(sourceItem.meta.supporting);
        }

        return _.map(items, function(item) {
            return new Article({
                id: item.id,
                meta: cleanClone(item.meta),
                group: targetGroup
            });
        });
    }

    function newItemsValidator(newItems) {
        return contentApi.validateItem(newItems[0]);
    }

    function newItemsPersister(newItems, sourceGroup, targetGroup, position, isAfter) {
        var id = newItems[0].id(),
            itemMeta,
            supporting,
            remove;

        if (!targetGroup || !targetGroup.parent) { return; }

        if (targetGroup.parentType === 'Article') {
            supporting = targetGroup.parent.meta.supporting.items;
            _.each(newItems.slice(1), function(item) {
                supporting.remove(function (supp) { return supp.id() === item.id(); });
                supporting.push(item);
            });
            contentApi.decorateItems(supporting());
            targetGroup.parent.save();

            remove = remover(sourceGroup, id);
            if (remove) {
                authedAjax.updateCollections({remove: remove});
                removeById(sourceGroup.items, id);
            }
        }

        if (targetGroup.parentType === 'Collection') {
            targetGroup.parent.closeAllArticles();
            itemMeta = newItems[0].getMeta() || {};

            if (deepGet(targetGroup, '.parent.groups.length') > 1) {
                itemMeta.group = targetGroup.group + '';
            } else {
                delete itemMeta.group;
            }

            remove = (deepGet(sourceGroup, '.parent.id') && deepGet(sourceGroup, '.parent.id') !== targetGroup.parent.id);
            remove = remove ? remover(sourceGroup, id) : undefined;

            authedAjax.updateCollections({
                update: {
                    collection: targetGroup.parent,
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

            if (sourceGroup && !sourceGroup.keepCopy && sourceGroup !== targetGroup) {
                removeById(sourceGroup.items, id); // for immediate UI effect
            }
        }
    }

    function remover(sourceGroup, id) {
        if (sourceGroup &&
            sourceGroup.parentType === 'Collection' &&
           !sourceGroup.keepCopy) {

            return {
                collection: sourceGroup.parent,
                id:     sourceGroup.parent.id,
                item:   id,
                live:   vars.state.liveMode(),
                draft: !vars.state.liveMode()
            };
        }
    }

    return {
        newItemsConstructor: newItemsConstructor,
        newItemsValidator: newItemsValidator,
        newItemsPersister: newItemsPersister
    };
});
