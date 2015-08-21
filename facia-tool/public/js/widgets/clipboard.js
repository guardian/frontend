import * as vars from 'modules/vars';
import ko from 'knockout';
import _ from 'underscore';
import BaseWidget from 'widgets/base-widget';
import Article from 'models/collections/article';
import Group from 'models/group';
import * as contentApi from 'modules/content-api';
import copiedArticle from 'modules/copied-article';
import * as globalListeners from 'utils/global-listeners';
import * as storage from 'utils/local-storage';
import mediator from 'utils/mediator';
import updateScrollables from 'utils/update-scrollables';

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

var classCount = 0;

class Clipboard extends BaseWidget {
    constructor(params) {
        super();

        this.storage = storage.bind('gu.front-tools.clipboard.' +
            (classCount ? classCount + '.' : '') + vars.model.identity.email);
        classCount += 1;
        this.uiOpenElement = ko.observable();
        this.column = params.column;
        this.group = new Group({
            parentType: 'Clipboard',
            keepCopy:  true,
            front: null,
            elementHasFocus: this.elementHasFocus.bind(this)
        });
        this.group.items(this.getItemsFromStorage());

        this.listenOn(mediator, 'ui:open', this.onUIOpen);
        this.listenOn(copiedArticle, 'change', this.onCopiedChange);
        this.pollArticlesChange(this.saveInStorage.bind(this));

        this.hasCopiedArticle = ko.observable(false).extend({ notify: 'always' });
        this.inCopiedArticle = ko.pureComputed(this.getCopiedArticle, this);
        this.dropdownOpen = ko.observable(false);

        globalListeners.on('paste', this.onGlobalPaste, this);
    }

    getCopiedArticle() {
        var inMemory = this.hasCopiedArticle() && copiedArticle.peek();

        return inMemory ? inMemory.displayName : null;
    }

    elementHasFocus(meta) {
        return meta === this.uiOpenElement();
    }

    onUIOpen(element, article, front) {
        if (!front) {
            this.uiOpenElement(element);
        }
        updateClipboardScrollable(article ? {
            targetGroup: article.group
        } : null);
    }

    onCopiedChange(hasArticle) {
        this.hasCopiedArticle(hasArticle);
        if (!hasArticle) {
            this.dropdownOpen(false);
        }
    }

    flushCopiedArticles() {
        copiedArticle.flush();
    }

    onGlobalPaste(evt) {
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
    }

    getItemsFromStorage() {
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
    }

    saveInStorage() {
        var allItems = _.map(this.group.items(), function (item) {
            return item.get();
        });
        this.storage.setItem(allItems);
    }

    pollArticlesChange(callback) {
        // Because I want to save intermediate states, in case the browser crashes
        // before the user clicks on 'save article', save regularly the current state
        this.pollID = setInterval(callback, vars.CONST.detectPendingChangesInClipboard);
    }

    dispose() {
        super.dispose();
        this.group.dispose();
        globalListeners.off('paste', null, this);
        clearInterval(this.pollID);
        classCount -= 1;
    }
}

export default Clipboard;
