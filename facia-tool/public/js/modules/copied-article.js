define([
    'underscore',
    'modules/vars',
    'utils/mediator'
], function(
    _,
    vars,
    mediator
) {
    var storage = window.localStorage,
        storageKeyCopied ='gu.fronts-tool.copied';

    return {
        flush: function() {
            storage.removeItem(storageKeyCopied);
            mediator.emit('copied-article:change', false);
        },

        set: function(article) {
            var group = article.group || {},
                front = group.front,
                title = article.meta.snapType() === 'latest' ? '{ ' + article.meta.customKicker() + ' }' : article.meta.headline();

            if (!title && article.fields) {
                title = article.fields.headline();
            }

            storage.setItem(storageKeyCopied, JSON.stringify({
                article: article.get(),
                groupIndex: group.index,
                frontPosition: front ? front.position() : undefined,
                groupParentId: group.parent ? group.parent.id : undefined,
                displayName: title
            }));
            mediator.emit('copied-article:change', true);
        },

        get: function(detachFromSource) {
            var obj = storage.getItem(storageKeyCopied),
                sourceCollection;

            if (!obj) { return; }

            obj = JSON.parse(obj);

            if (detachFromSource) {
                storage.setItem(storageKeyCopied, JSON.stringify({
                    article: obj.article
                }));
            }
            var sourceFront = vars.model.loadedFronts()[obj.frontPosition];

            sourceCollection = sourceFront ? _.find(sourceFront.collections(), function(collection) {
                return collection.id === obj.groupParentId;
            }) : null;

            obj.article.group = sourceCollection ? _.find(sourceCollection.groups, function(group) {
                return group.index === obj.groupIndex;
            }) : undefined;

            return obj.article;
        },

        peek: function() {
            var obj = storage.getItem(storageKeyCopied);

            if (obj) {
                return JSON.parse(obj);
            }
        }
    };
});
