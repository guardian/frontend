define([], function() {
    var storage = window.localStorage,
        storageKeyCopied ='gu.fronts-tool.copied';

    return {
        set: function(obj) {
            storage.setItem(storageKeyCopied, JSON.stringify(obj));
        },
        get: function() {
            var obj = storage.getItem(storageKeyCopied);

            return obj ? JSON.parse(obj) : undefined;
        }
    };
});