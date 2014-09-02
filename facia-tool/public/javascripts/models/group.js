/* global _: true */
define([
    'knockout',
    'modules/vars',
    'modules/copied-article',
    'utils/mediator'
], function(
    ko,
    vars,
    copiedArticle,
    mediator
) {
    function Group(opts) {
        var self = this;

        opts = opts || {};

        this.items = ko.isObservable(opts.items) && opts.items.push ? opts.items : ko.observableArray(opts.items);
        this.underDrag  = ko.observable();
        this.index      = opts.index || 0;
        this.name       = opts.name || '';
        this.parent     = opts.parent;
        this.parentType = opts.parentType;
        this.keepCopy   = opts.keepCopy;

        this.closeAllExcept = function(article) {
            this.items().forEach(function(a) {
                if (a !== article) {
                    a.close();
                }
            });
        }

        this.pasteItem = function() {
            var sourceItem = copiedArticle.get(true);

            if(!sourceItem) { return; }

            mediator.emit('collection:updates', {
                sourceItem: sourceItem,
                sourceGroup: sourceItem.group,
                targetItem: _.last(this.items()),
                targetGroup: this,
                isAfter: true
            });
        };

        this.omitItem   = function(item) {
            self.items.remove(item);
            if (_.isFunction(opts.omitItem)) { opts.omitItem(item); }
        };
    }

    return Group;
});
