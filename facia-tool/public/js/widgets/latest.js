/* globals _ */
define([
    'knockout',
    'models/collections/latest-articles',
    'models/group',
    'modules/vars',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    ko,
    LatestArticles,
    Group,
    vars,
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

    function Latest (params, element) {
        this.uiOpenElement = ko.observable();
        this.latestArticles = new LatestArticles({
            filterTypes: vars.CONST.filterTypes,
            container: element
        });
        this.clipboard = new Group({
            parentType: 'Clipboard',
            keepCopy:  true,
            front: null,
            elementHasFocus: this.elementHasFocus.bind(this)
        });

        this.latestArticles.search();
        this.latestArticles.startPoller();


        var model = this;
        this.onUIOpen = function(element, article, front) {
            if (!front) {
                model.uiOpenElement(element);
            }
            updateClipboardScrollable(article ? {
                targetGroup: article.group
            } : null);
        };
        mediator.on('ui:open', this.onUIOpen);

        this.subscriptionOnArticles = this.latestArticles.articles.subscribe(updateScrollables);

        mediator.emit('latest:loaded');
    }

    Latest.prototype.elementHasFocus = function (meta) {
        return meta === this.uiOpenElement();
    };

    Latest.prototype.dispose = function () {
        mediator.off('ui:open', this.onUIOpen);
        this.subscriptionOnArticles.dispose();
    };

    return {
        createViewModel: function (params, componentInfo) {
            return new Latest(params, componentInfo.element);
        }
    };
});
