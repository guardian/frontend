import _ from 'underscore';
import Article from 'models/collections/article';
import ConfigCollection from 'models/config/collection';
import * as authedAjax from 'modules/authed-ajax';
import * as capi from 'modules/content-api';
import * as vars from 'modules/vars';
import alert from 'utils/alert';
import cleanClone from 'utils/clean-clone';
import cloneWithKey from 'utils/clone-with-key';
import deepGet from 'utils/deep-get';
import findFirstById from 'utils/find-first-by-id';
import mediator from 'utils/mediator';
import removeById from 'utils/remove-by-id';
import urlAbsPath from 'utils/url-abs-path';

export default function (source, targetItem, targetGroup, alternate) {
    return (alternate ? alternateAction : defaultAction)(source, targetItem, targetGroup);
}

function alternateAction (source, targetItem, targetGroup) {
    // TODO Phantom babel bug
    var sourceItem = source.sourceItem;
    if (targetItem.parentType !== 'Article') {
        alert('You can only do this action on an opened article.');
    } else {
        var id = urlAbsPath(sourceItem.id);

        if (id.indexOf(vars.CONST.internalPagePrefix) !== 0) {
            alert('Sorry, but you can\'t use that item.');
        } else {
            return replaceArticleWith(id, sourceItem, targetGroup.parent, targetGroup);
        }
    }
}

function defaultAction (source, targetItem, targetGroup) {
    return (source.mediaItem ? handleMedia : handleInternalClass)(source, targetItem, targetGroup);
}

function handleMedia (source, targetItem, targetGroup) {
    // TODO Phantom babel bug
    var sourceItem = source.sourceItem, mediaItem = source.mediaItem;
    if (sourceItem.type === vars.CONST.draggableTypes.configCollection) {
        alert('Unhandled media item');
    } else {
        var article = targetGroup && targetGroup.parentType === 'Article' ? targetGroup.parent : undefined;

        if (article) {
            article.meta.imageReplace(true);
            // Singleton images
            article.meta.imageCutoutReplace(false);
            article.meta.showMainVideo(false);
            article.meta.imageSlideshowReplace(false);
            article.meta.imageSrc(mediaItem.file);
        } else {
            alert('You can only drop media into an opened article.');
        }
    }
}

function handleInternalClass (source, targetItem, targetGroup) {
    // TODO Phantom babel bug
    var sourceItem = source.sourceItem, sourceGroup = source.sourceGroup;
    var {position, target, isAfter} = normalizeTarget(sourceItem, targetItem, targetGroup);

    removeById(targetGroup.items, urlAbsPath(sourceItem.id));

    var insertAt = targetGroup.items().indexOf(target) + (isAfter || 0);
    insertAt = insertAt === -1 ? targetGroup.items().length : insertAt;

    var newItems = newItemsConstructor(sourceItem, targetGroup);

    if (!newItems[0]) {
        alert('Sorry, but you can\'t add that item');
    } else {
        var targetContext = targetGroup.front;

        targetGroup.items.splice(insertAt, 0, newItems[0]);

        return validate(sourceItem, newItems, targetContext)
        .then(() => {
            if (targetGroup.parent) {
                return persist(sourceItem, newItems, sourceItem.front, sourceGroup, targetContext, targetGroup, position, isAfter);
            }
        })
        .catch(err => {
            _.each(newItems, item => targetGroup.items.remove(item));
            alert(err);
        });
    }
}

function replaceArticleWith (id, sourceItem, oldItem, targetGroup) {
    var newItems = newItemsConstructor({id}, targetGroup);

    if (!newItems[0]) {
        alert('Sorry, but you can\'t use that item.');
    } else {
        var newItem = newItems[0];
        var targetContext = targetGroup.front;
        var returnValue;

        _.chain(oldItem.meta)
            .keys()
            .each(key => {
                if (_.isFunction(oldItem.meta[key])) {
                    newItem.meta[key](oldItem.meta[key]());
                } else {
                    newItem.meta[key] = oldItem.meta[key];
                }
            });

        var sourceGroup = oldItem.group;
        var itemMeta = newItem.getMeta() || {};
        var update = {
            collection: sourceGroup.parent,
            item: newItem.id(),
            position: oldItem.id(),
            after: false,
            mode: targetContext.mode(),
            itemMeta: _.isEmpty(itemMeta) ? undefined : itemMeta
        };
        var remove = remover(targetContext, sourceGroup, oldItem.id());
        var detectPressFailure = targetContext.mode() === 'live' ? function () {
            mediator.emit('presser:detectfailures', targetContext.front());
        } : function () {};

        returnValue = authedAjax.updateCollections({ update })
        .then(() => {
            return authedAjax.updateCollections({ remove });
        })
        .then(detectPressFailure)
        .catch(detectPressFailure);

        if (sourceGroup && !sourceGroup.keepCopy) {
            var insertAt = sourceGroup.items().indexOf(oldItem);
            sourceGroup.items.splice(insertAt, 1, newItem); // for immediate UI effect
        }

        return returnValue;
    }
}

function normalizeTarget (sourceItem, targetItem, targetGroup) {
    var isAfter, target, position;
    if (targetItem.normalizeDropTarget) {
        ({isAfter, target} = targetItem.normalizeDropTarget(targetGroup));
    } else if (sourceItem.type === vars.CONST.draggableTypes.configCollection) {
        isAfter = true;
        target = targetItem;
    } else {
        throw new Error('Unable to drag this item');
    }

    position = target && _.isFunction(target.id) ? target.id() : undefined;
    return {isAfter, target, position};
}

function newItemsConstructor (sourceItem, targetGroup) {
    // TODO Phantom babel bug
    if (!sourceItem) { sourceItem = {}; }
    if (sourceItem.type === vars.CONST.draggableTypes.configCollection) {
        var collectionConfig = cloneWithKey(vars.model.state().config.collections[sourceItem.id], sourceItem.id);
        return [new ConfigCollection(collectionConfig)];
    } else {
        var items = [_.extend({}, sourceItem)];

        if (sourceItem && sourceItem.meta && sourceItem.meta.supporting) {
            items = items.concat(sourceItem.meta.supporting);
        }

        return _.map(items, item => new Article({
            id: item.id,
            meta: cleanClone(item.meta),
            group: targetGroup
        }));
    }
}

function validate (sourceItem, newItems, context) {
    if (sourceItem.type === vars.CONST.draggableTypes.configCollection) {
        return Promise.resolve();
    } else {
        var maxChars = vars.CONST.restrictedHeadlineLength || 90,
            restrictHeadlinesOn = vars.CONST.restrictHeadlinesOn || [],
            restrictedLiveMode = vars.CONST.restrictedLiveMode || [];

        return capi.validateItem(newItems[0])
        .then(item => {
            var front = context ? context.front() : '',
                err;

            if (item.group.parentType === 'Collection') {
                if (restrictHeadlinesOn.indexOf(front) > -1 && (item.meta.headline() || item.fields.headline()).length > maxChars) {
                    err = 'Sorry, a ' + front + ' headline must be ' + maxChars + ' characters or less. Edit it first within the clipboard.';
                }
                if (restrictedLiveMode.indexOf(front) > -1 && context.mode() === 'live') {
                    err = 'Sorry, ' + front + ' items cannot be added in Live Front mode. Switch to Draft Front then try again.';
                }
                if (!err) {
                    err = context.newItemValidator(item);
                }
            }

            if (err) {
                throw new Error(err);
            } else {
                return item;
            }
        });
    }
}

function persist (sourceItem, newItems, sourceContext, sourceGroup, targetContext, targetGroup, position, isAfter) {
    if (sourceItem.type === vars.CONST.draggableTypes.configCollection) {
        if (!findFirstById(newItems[0].parents, targetGroup.parent.id())) {
            newItems[0].parents.push(targetGroup.parent.opts);
        }

        return targetGroup.parent.saveProps();
    } else {
        var id = newItems[0].id(),
            itemMeta,
            supporting,
            update,
            remove,
            returnValue;

        if (!targetGroup || !targetGroup.parent) {
            return;

        } else if (targetGroup.parentType === 'Article') {
            supporting = targetGroup.parent.meta.supporting.items;
            _.each(newItems.slice(1), function(item) {
                supporting.remove(function (supp) { return supp.id() === item.id(); });
                supporting.push(item);
            });
            returnValue = capi.decorateItems(supporting());

            remove = remover(sourceContext, sourceGroup, id);

        } else if (targetGroup.parentType === 'Collection') {
            itemMeta = newItems[0].getMeta() || {};

            if (deepGet(targetGroup, '.parent.groups.length') > 1) {
                itemMeta.group = targetGroup.index + '';
            } else {
                delete itemMeta.group;
            }

            update = {
                collection: targetGroup.parent,
                item:     id,
                position: position,
                after:    isAfter,
                mode:     targetContext.mode(),
                itemMeta: _.isEmpty(itemMeta) ? undefined : itemMeta
            };

            remove = sourceGroup && sourceGroup.parentType === 'Collection' && (deepGet(sourceGroup, '.parent.id') && deepGet(sourceGroup, '.parent.id') !== targetGroup.parent.id);
            remove = remove ? remover(sourceContext, sourceGroup, id) : undefined;
        }

        if (sourceContext !== targetContext) {
            remove = false;
        }

        if (update || remove) {
            returnValue = authedAjax.updateCollections({
                update: update,
                remove: remove
            })
            .then(function () {
                if (targetContext.mode() === 'live') {
                    mediator.emit('presser:detectfailures', targetContext.front());
                }
            });
        }

        if (remove !== false && sourceGroup && !sourceGroup.keepCopy && sourceGroup !== targetGroup && sourceGroup.items) {
            removeById(sourceGroup.items, id); // for immediate UI effect
        }
        return returnValue;
    }
}

function remover (sourceContext, sourceGroup, id) {
    if (sourceContext && sourceGroup &&
        sourceGroup.parentType === 'Collection' &&
       !sourceGroup.keepCopy) {

        return {
            collection: sourceGroup.parent,
            id:     sourceGroup.parent.id,
            item:   id,
            mode:   sourceContext.mode()
        };
    }
}
