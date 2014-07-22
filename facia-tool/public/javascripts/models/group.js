/* global _: true */
define([
    'knockout',
    'utils/mediator'
], function(
    ko,
    mediator
) {
    var storage = window.localStorage,
        storageKeyCopied ='gu.fronts-tool.copied';

    function Group(opts) {
        var self = this;

        opts = opts || {};

        this.items = ko.isObservable(opts.items) && opts.items.push ? opts.items : ko.observableArray(opts.items);

        this.underDrag  = ko.observable();
        this.group      = opts.group || 0;
        this.name       = opts.name || '';

        this.parent     = opts.parent;
        this.parentType = opts.parentType;

        this.keepCopy   = opts.keepCopy;
        this.reflow     = opts.reflow  || function() {};

        this.pasteItem = function() {
            var sourceItem = storage.getItem(storageKeyCopied);

            if(!sourceItem) { return; }

            sourceItem = JSON.parse(sourceItem);

            mediator.emit('collection:updates', {
                id: sourceItem.id,
                sourceItem: sourceItem,
                targetItem: _.last(this.items()),
                targetList: this,
                isAfter: true
            });
        };

        this.omitItem   = function(item) {
            item.copy();
            self.items.remove(item);
            self.reflow();
            if (_.isFunction(opts.omitItem)) { opts.omitItem(item); }
        };
    }

    return Group;
});
