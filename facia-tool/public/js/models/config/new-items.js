import Promise from 'Promise';
import * as vars from 'modules/vars';
import urlAbsPath from 'utils/url-abs-path';
import findFirstById from 'utils/find-first-by-id';

function newItemsConstructor (id) {
    return [findFirstById(vars.model.collections, urlAbsPath(id))];
}

function newItemsValidator (newItems) {
    return Promise[newItems[0] ? 'resolve' : 'reject']();
}

function newItemsPersister (newItems, sourceContext, sourceGroup, targetContext, targetGroup) {
    if (newItems[0].parents.indexOf(targetGroup.parent) < 0) {
        newItems[0].parents.push(targetGroup.parent);
    }

    targetGroup.parent.saveProps();
}

export {
    newItemsConstructor,
    newItemsValidator,
    newItemsPersister
};
