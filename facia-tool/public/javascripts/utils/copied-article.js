/* global _: true */
define([], function() {
    var storage = window.localStorage,
        storageKeyCopied ='gu.fronts-tool.copied';

    return {

        set: function(article) {
            storage.setItem(storageKeyCopied, JSON.stringify({
                article: article.get(),
                groupIndex: article.group ? article.group.index : undefined,
                groupParentId: article.group && article.group.parent ? article.group.parent.id : undefined
            }));
        },

        get: function(fromCollections) {
            var obj = storage.getItem(storageKeyCopied),
                sourceCollection;

            if (!obj) { return; }

            obj = JSON.parse(obj);

            sourceCollection = _.find(fromCollections, function(collection) {
                return collection.id === obj.groupParentId;
            });

            obj.article.group = sourceCollection ? _.find(sourceCollection.groups, function(group) {
                return group.index === obj.groupIndex;
            }) : undefined;

            return obj.article;
        }
    };
});