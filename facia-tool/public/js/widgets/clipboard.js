/* global _ */
define([
    'knockout',
    'models/group',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    ko,
    Group,
    mediator,
    updateScrollables
) {
    var updateClipboardScrollable = function (what) {
        var onClipboard = true;
        if (what && what.targetGroup) {
            onClipboard = what.targetGroup.parentType === 'Clipboard';
        }
        if (onClipboard) {
            _.defer(updateScrollables);
        }
    };

    mediator.on('collection:updates', updateClipboardScrollable);
    mediator.on('ui:close', updateClipboardScrollable);
    mediator.on('ui:omit', updateClipboardScrollable);
    mediator.on('ui:resize', updateClipboardScrollable);

    function Clipboard (params) {
        var listeners = mediator.scope();

        this.uiOpenElement = ko.observable();
        this.column = params.column;
        this.group = new Group({
            parentType: 'Clipboard',
            keepCopy:  true,
            front: null,
            elementHasFocus: this.elementHasFocus.bind(this)
        });
        this.listeners = listeners;

        listeners.on('ui:open', this.onUIOpen.bind(this));
    }

    Clipboard.prototype.elementHasFocus = function (meta) {
        return meta === this.uiOpenElement();
    };

    Clipboard.prototype.onUIOpen = function (element, article, front) {
        if (!front) {
            this.uiOpenElement(element);
        }
        updateClipboardScrollable(article ? {
            targetGroup: article.group
        } : null);
    };

    return Clipboard;
});
