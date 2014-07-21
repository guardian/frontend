/* global _: true */
define([
    'modules/vars',
    'modules/authed-ajax',
    'modules/content-api',
    'models/collections/article',
    'utils/mediator',
    'utils/clean-clone',
    'utils/deep-get',
    'utils/url-abs-path',
    'utils/remove-by-id'
], function(
    vars,
    authedAjax,
    contentApi,
    Article,
    mediator,
    cleanClone,
    deepGet,
    urlAbsPath,
    removeById
) {

    function newItemsConstructor(id, sourceItem, targetList) {
        var items = [_.extend(_.isObject(sourceItem) ? sourceItem : {}, { id: id })];

        if(sourceItem && sourceItem.meta && sourceItem.meta.supporting) {
            items = items.concat(sourceItem.meta.supporting);
        }

        return _.map(items, function(item) {
            return new Article({
                id: item.id,
                meta: cleanClone(item.meta),
                group: targetList,
                parent: targetList.parent,
                parentType: targetList.parentType
            });
        });
    }

    function newItemsValidator(newItems) {
        return contentApi.validateItem(newItems[0]);
    }

    function newItemsPersister(newItems, sourceList, targetList, position, isAfter) {
        var id = newItems[0].id(),
            itemMeta,
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

    function alertBadContent(id, msg) {
        window.alert(msg ? msg + '. ' + id : 'Sorry, but you can\'t add' + (id ? ': ' + id : ' that'));
    }

    /* params:
        opts.id
        opts.sourceItem
        opts.sourceList (optional)

        opts.targetItem (optional)
        opts.targetList

        opts.isAfter (optional)
    */
    function listManager(opts) {
        var position,
            newItems,
            insertAt;

        position = opts.targetItem && _.isFunction(opts.targetItem.id) ? opts.targetItem.id() : undefined;

        removeById(opts.targetList.items, urlAbsPath(opts.id));

        insertAt = opts.targetList.items().indexOf(opts.targetItem) + (opts.isAfter || 0);
        insertAt = insertAt === -1 ? opts.targetList.items().length : insertAt;

        newItems = newItemsConstructor(opts.id, opts.sourceItem, opts.targetList);

        if (!newItems[0]) {
            alertBadContent(opts.id, null);
            return;
        }

        opts.targetList.items.splice(insertAt, 0, newItems[0]);

        newItemsValidator(newItems)
        .fail(function(err) {
            _.each(newItems, function(item) { opts.targetList.items.remove(item); });
            alertBadContent(opts.id, err);
        })
        .done(function() {
            if (_.isFunction(opts.targetList.reflow)) {
                opts.targetList.reflow();
            }

            if (!opts.targetList.parent) {
                return;
            }

            newItemsPersister(newItems, opts.sourceList, opts.targetList, position, opts.isAfter);
        });
    }

    return {
        init: _.once(function() {
            mediator.on('collection:updates', listManager);
        })
    };
});
