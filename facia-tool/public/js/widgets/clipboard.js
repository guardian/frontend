define([
    'knockout',
    'underscore',
    'models/group',
    'modules/cache',
    'modules/copied-article',
    'utils/global-listeners',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    ko,
    _,
    Group,
    cache,
    copiedArticle,
    globalListeners,
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
        listeners.on('copied-article:change', this.onCopiedChange.bind(this));

        this.hasCopiedArticle = ko.observable(false).extend({ notify: 'always' });
        this.inCopiedArticle = ko.pureComputed(this.getCopiedArticle, this);
        this.dropdownOpen = ko.observable(false);

        globalListeners.on('paste', this.onGlobalPaste, this);
    }

    Clipboard.prototype.getCopiedArticle = function () {
        var inMemory = this.hasCopiedArticle() && copiedArticle.peek();

        return inMemory ? inMemory.displayName : null;
    };

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

    Clipboard.prototype.onCopiedChange = function (hasArticle) {
        this.hasCopiedArticle(hasArticle);
        if (!hasArticle) {
            this.dropdownOpen(false);
        }
    };

    Clipboard.prototype.flushCopiedArticles = function () {
        copiedArticle.flush();
    };

    Clipboard.prototype.onGlobalPaste = function (evt) {
        var activeElement = ((document.activeElement || {}).tagName || '').toLowerCase(),
            clipboard = evt.originalEvent.clipboardData.getData('Text');

        if (['input', 'textarea'].indexOf(activeElement) !== -1 || !/^(http[s]?:)?\/\//.test(clipboard)) {
            return;
        }

        this.group.drop({
            sourceItem: {
                id: clipboard
            }
        }, this.group, false);
    };

    Clipboard.prototype.dispose = function () {
        globalListeners.off('paste', null, this);
    };

    return Clipboard;
});
