import ko from 'knockout';
import _ from 'underscore';
import DropTarget from 'models/drop-target';
import copiedArticle from 'modules/copied-article';
import mediator from 'utils/mediator';

export default class Group extends DropTarget {
    constructor(opts) {
        // TODO Phantom Babel bug
        if (!opts) { opts = {}; }
        super();

        this.items = ko.isObservable(opts.items) && opts.items.push ? opts.items : ko.observableArray(opts.items);
        this.underDrag = ko.observable();
        this.underControlDrag = ko.observable();

        this.index = opts.index || 0;
        this.name = opts.name || '';
        this.parent = opts.parent;
        this.parentType = opts.parentType;
        this.keepCopy = opts.keepCopy;
        this.front = opts.front;
        this.opts = opts;

        this.elementHasFocus = opts.elementHasFocus || (opts.front ? opts.front.elementHasFocus.bind(opts.front) : null);
    }

    pasteItem() {
        var sourceItem = copiedArticle.get(true);

        if (!sourceItem) { return; }

        mediator.emit('drop', {
            sourceItem: sourceItem.article.get(),
            sourceGroup: sourceItem.group
        }, this, this);
    }

    omitItem(item) {
        this.items.remove(item);
        if (_.isFunction(this.opts.omitItem)) {
            this.opts.omitItem(item);
        }
        mediator.emit('ui:omit', {
            targetGroup: this
        });
    }

    setAsTarget(targetItem, alternateAction) {
        this.underDrag(targetItem.constructor === Group);
        this.underControlDrag(alternateAction);
        _.each(this.items(), item => {
            var underDrag = (item === targetItem);
            if (underDrag !== item.state.underDrag()) {
                item.state.underDrag(underDrag);
            }
            item.state.underControlDrag(alternateAction);
        });
    }

    unsetAsTarget() {
        this.underDrag(false);
        this.underControlDrag(false);
        _.each(this.items(), item => {
            if (item.state.underDrag()) {
                item.state.underDrag(false);
            }
            item.state.underControlDrag(false);
        });
    }

    normalizeDropTarget(targetGroup) {
        var isAfter, target;
        // Dragging above a Group is like dragging above the last item in that group
        // or if there aren't any other items, above those in the first preceding group that contains items.
        isAfter = false;

        target = _.last(targetGroup.items());
        if (target) {
            isAfter = true;
        } else if (targetGroup.parentType === 'Collection') {
            let groups = targetGroup.parent.groups;
            for (var i = groups.indexOf(targetGroup) - 1; i >= 0; i -= 1) {
                target = _.last(groups[i].items());
                if (target) {
                    isAfter = true;
                    break;
                }
            }
        }

        return {isAfter, target};
    }
}
