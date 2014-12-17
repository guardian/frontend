/* global _: true */
define([
    'modules/vars'
], function(
    vars
) {
    var storage = window.localStorage,
        storageKeyCopied ='gu.fronts-tool.copied';

    return {
        flush: function() {
            storage.removeItem(storageKeyCopied);
        },

        set: function(article) {
            storage.setItem(storageKeyCopied, JSON.stringify({
                article: article.get(),
                groupIndex: article.group ? article.group.index : undefined,
                frontPosition: article.group ? article.group.front.position() : undefined,
                groupParentId: article.group && article.group.parent ? article.group.parent.id : undefined
            }));
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
        }
    };
});
