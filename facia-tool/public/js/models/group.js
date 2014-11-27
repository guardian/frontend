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

    Group.prototype.setAsTarget = function(targetItem) {
        this.underDrag(targetItem.constructor === Group);
        _.each(this.items(), function(item) {
            var underDrag = (item === targetItem);
            if (underDrag !== item.state.underDrag()) {
                item.state.underDrag(underDrag);
            }
        });
    };

    Group.prototype.unsetAsTarget = function() {
        this.underDrag(false);
        _.each(this.items(), function(item) {
            if (item.state.underDrag()) {
                item.state.underDrag(false);
            }
        });
    };

    Group.prototype.drop = function(source, targetGroup) {
        var isAfter = false, groups;
        // assume it's to be appended *after* the other items in this group,
        var targetItem = _.last(targetGroup.items());
        if (targetItem) {
            isAfter = true;
        // or if there arent't any other items, after those in the first preceding group that contains items.
        } else if (targetGroup.parentType === 'Collection') {
            groups = targetGroup.parent.groups;
            for (var i = groups.indexOf(targetGroup) - 1; i >= 0; i -= 1) {
                targetItem = _.last(groups[i].items());
                if (targetItem) {
                    isAfter = true;
                    break;
                }
            }
        }

        mediator.emit('collection:updates', {
            sourceItem: source.sourceItem,
            sourceGroup: source.sourceGroup,
            targetItem: targetItem,
            targetGroup: targetGroup,
            isAfter: isAfter,
            mediaItem: source.mediaItem
        });
    };

    return Group;
});
