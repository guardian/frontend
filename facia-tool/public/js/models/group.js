define([
    'knockout',
    'underscore',
    'modules/copied-article',
    'utils/mediator'
], function(
    ko,
    _,
    copiedArticle,
    mediator
) {
    function Group(opts) {
        var self = this;

        opts = opts || {};

        this.items = ko.isObservable(opts.items) && opts.items.push ? opts.items : ko.observableArray(opts.items);
        this.underDrag  = ko.observable();
        this.underControlDrag  = ko.observable();
        this.index      = opts.index || 0;
        this.name       = opts.name || '';
        this.parent     = opts.parent;
        this.parentType = opts.parentType;
        this.keepCopy   = opts.keepCopy;
        this.front      = opts.front;

        this.elementHasFocus = opts.elementHasFocus || (opts.front ? opts.front.elementHasFocus.bind(opts.front) : null);

        this.pasteItem = function() {
            var sourceItem = copiedArticle.get(true),
                targetItem;

            if(!sourceItem) { return; }
            targetItem = _.last(this.items());

            mediator.emit('collection:updates', {
                sourceItem: sourceItem,
                sourceGroup: sourceItem.group,
                targetItem: targetItem,
                targetGroup: this,
                sourceContext: sourceItem.front,
                targetContext: this.front,
                isAfter: true
            });
        };

        this.omitItem   = function(item) {
            self.items.remove(item);
            if (_.isFunction(opts.omitItem)) { opts.omitItem(item); }
            mediator.emit('ui:omit', {
                targetGroup: self
            });
        };
    }

    Group.prototype.setAsTarget = function(targetItem, alternateAction) {
        this.underDrag(targetItem.constructor === Group);
        this.underControlDrag(alternateAction);
        _.each(this.items(), function(item) {
            var underDrag = (item === targetItem);
            if (underDrag !== item.state.underDrag()) {
                item.state.underDrag(underDrag);
            }
            item.state.underControlDrag(alternateAction);
        });
    };

    Group.prototype.unsetAsTarget = function() {
        this.underDrag(false);
        this.underControlDrag(false);
        _.each(this.items(), function(item) {
            if (item.state.underDrag()) {
                item.state.underDrag(false);
            }
            item.state.underControlDrag(false);
        });
    };

    Group.prototype.drop = function(source, targetGroup, alternateAction) {
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
            mediaItem: source.mediaItem,
            alternateAction: alternateAction,
            sourceContext: source.sourceItem.front,
            targetContext: targetGroup.front
        });
    };

    return Group;
});
