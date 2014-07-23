/* global _: true */
define([], function() {
    var storage = window.localStorage,
        storageKeyCopied ='gu.fronts-tool.copied';

    return {

        set: function(article) {
            storage.setItem(storageKeyCopied, JSON.stringify({
                article: article.get(),
                group: article.group.group,
                groupParentId: article.group.parent.id
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
                return group.group === obj.group;
            }) : undefined;

            return obj.article;
        }
    };
});