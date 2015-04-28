define([
    'modules/vars',
    'knockout',
    'underscore',
    'models/collections/article',
    'models/group',
    'modules/cache',
    'modules/content-api',
    'modules/copied-article',
    'utils/global-listeners',
    'utils/local-storage',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    vars,
    ko,
    _,
    Article,
    Group,
    cache,
    contentApi,
    copiedArticle,
    globalListeners,
    storage,
    mediator,
    updateScrollables
) {
    mediator = mediator.default;

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

        this.storage = storage.bind('gu.front-tools.clipboard.' + vars.identity.email);
        this.uiOpenElement = ko.observable();
        this.column = params.column;
        this.group = new Group({
            parentType: 'Clipboard',
            keepCopy:  true,
            front: null,
            elementHasFocus: this.elementHasFocus.bind(this)
        });
        this.group.items(this.getItemsFromStorage());
        this.listeners = listeners;

        listeners.on('ui:open', this.onUIOpen.bind(this));
        listeners.on('copied-article:change', this.onCopiedChange.bind(this));
        this.pollArticlesChange(this.saveInStorage.bind(this));

        this.hasCopiedArticle = ko.observable(false).extend({ notify: 'always' });
        this.inCopiedArticle = ko.pureComputed(this.getCopiedArticle, this);
        this.dropdownOpen = ko.observable(false);

        globalListeners.on('paste', this.onGlobalPaste, this);
        mediator.emit('clipboard:loaded', this);
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

    Clipboard.prototype.getItemsFromStorage = function () {
        var group = this.group,
            items = _.map(this.storage.getItem() || [], function (item) {
                return new Article(_.extend(item, {
                    group: group
                }));
            });
        if (items.length) {
            contentApi.decorateItems(_.filter(items, function (item) {
                return !item.meta.snapType();
            }));
        }
        return items;
    };

    Clipboard.prototype.saveInStorage = function () {
        var allItems = _.map(this.group.items(), function (item) {
            return item.get();
        });
        this.storage.setItem(allItems);
    };

    Clipboard.prototype.pollArticlesChange = function (callback) {
        // Because I want to save intermediate states, in case the browser crashes
        // before the user clicks on 'save article', save regularly the current state
        this.pollID = setInterval(callback, vars.CONST.detectPendingChangesInClipboard);
    };

    Clipboard.prototype.dispose = function () {
        globalListeners.off('paste', null, this);
        clearInterval(this.pollID);
        this.listeners.dispose();
    };

    return Clipboard;
});
