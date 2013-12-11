/* global _: true */
define([
    'knockout',
    'modules/vars',
    'utils/parse-query-params',
    'utils/url-abs-path',
    'modules/authed-ajax',
    'models/group',
    'models/article',
    'modules/content-api',
    'modules/ophan-api'
], function(
    ko,
    vars,
    parseQueryParams,
    urlAbsPath,
    authedAjax,
    Group,
    Article,
    contentApi,
    ophanApi
) {
    var sourceList,
        sourceItem;

    function init() {

        window.addEventListener("dragover", function(event) {
            event.preventDefault();
        },false);

        window.addEventListener("drop", function(event) {
            event.preventDefault();
        },false);

        ko.bindingHandlers.makeDropabble = {
            init: function(element) {

                element.addEventListener('dragstart', function(event) {
                    sourceList = ko.dataFor(element);
                    sourceItem = ko.dataFor(event.target);
                }, false);

                element.addEventListener('dragover', function(event) {
                    var targetList = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target);

                    event.preventDefault();
                    event.stopPropagation();

                    targetList.underDrag(targetItem.constructor === Group);
                    _.each(targetList.items(), function(item) {
                        var underDrag = (item === targetItem);
                        if (underDrag !== item.state.underDrag()) {
                            item.state.underDrag(underDrag);
                        }
                    });
                }, false);

                element.addEventListener('dragleave', function(event) {
                    var targetList = ko.dataFor(element);

                    event.preventDefault();
                    event.stopPropagation();

                    targetList.underDrag(false);
                    _.each(targetList.items(), function(item) {
                        if (item.state.underDrag()) {
                            item.state.underDrag(false);
                        }
                    });
                }, false);

                element.addEventListener('drop', function(event) {
                    var targetList = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target),
                        id = event.testData ? event.testData : event.dataTransfer.getData('Text'),
                        position,
                        article,
                        groups,
                        insertAt,
                        isAfter = false;

                    event.preventDefault();
                    event.stopPropagation();

                    if (!targetList.items || !targetList.underDrag) { return; }

                    targetList.underDrag(false);
                    _.each(targetList.items(), function(item) {
                        item.state.underDrag(false);
                    });

                    // If the item isn't dropped onto an article, asssume it's to be appended *after* the other items in this group,
                    if (targetItem.constructor === Group) {
                        targetItem = _.last(targetList.items());
                        if (targetItem) {
                            isAfter = true;
                        // or if there arent't any other items, after those in the first preceding group that contains items.
                        } else if (targetList.collection) {
                            groups = targetList.collection.groups;
                            for (var i = groups.indexOf(targetList) - 1; i >= 0; i -= 1) {
                                targetItem = _.last(groups[i].items());
                                if (targetItem) {
                                    isAfter = true;
                                    break;
                                }
                            }
                        }
                    }

                    position = targetItem && targetItem.props ? targetItem.props.id() : undefined;

                    _.each(parseQueryParams(id), function(url){
                        if (url && url.match(/^http:\/\/www.theguardian.com/)) {
                            id = url;
                        }
                    });

                    id = urlAbsPath(id);

                    if (!id) {
                        alertBadContent();
                        return;
                    }

                    if (targetList.collection) {
                        targetList.collection.state.loadIsPending(true);
                    }

                    // sourceItem var doesn't get repopulated when the drag was from an arbitrary link elsewhere
                    // so garbage collect it - if it's a leftover from a previous drag.
                    if(sourceItem && sourceItem.props.id() !== id) {
                        sourceItem = undefined;
                        sourceList = undefined;
                    }

                    removeMatchingItems(targetList, id);

                    insertAt = targetList.items().indexOf(targetItem) + isAfter;
                    insertAt = insertAt === -1 ? targetList.items().length : insertAt;
 
                    article = new Article({
                        id: id,
                        meta: sourceItem ? sourceItem.getMeta() : undefined
                    });

                    // just for UI
                    targetList.items.splice(insertAt, 0, article);

                    contentApi.validateItem(article)
                    .fail(function() {
                        removeMatchingItems(targetList, id);
                        if (targetList.collection) {
                            targetList.collection.state.loadIsPending(false);
                        }
                        alertBadContent();
                    })
                    .done(function() {
                        var itemMeta;

                        ophanApi.decorateItems([article]);

                        if (_.isFunction(targetList.reflow)) {
                            targetList.reflow();
                        }

                        if (!targetList.collection) { // this is a non-collection list, e.g. a clipboard, so no need for persistence
                            return;
                        }

                        itemMeta = sourceItem ? sourceItem.getMeta() : {};
                        itemMeta.group = targetList.group + '';

                        authedAjax.updateCollection(
                            'post',
                            targetList.collection,
                            {
                                item:     id,
                                position: position,
                                after:    isAfter,
                                live:     vars.state.liveMode(),
                                draft:   !vars.state.liveMode(),
                                itemMeta: itemMeta
                            }
                        );

                        if (!sourceList || !sourceList.collection || sourceList.keepCopy) {
                            return;
                        }

                        if (sourceList.collection.id === targetList.collection.id) {
                            return;
                        }

                        sourceList.collection.state.loadIsPending(true);

                        // just for UI
                        sourceList.items.remove(function(article) {
                            return article === sourceItem;
                        });

                        authedAjax.updateCollection(
                            'delete',
                            sourceList.collection,
                            {
                                item:   id,
                                live:   vars.state.liveMode(),
                                draft: !vars.state.liveMode()
                            }
                        );
                    });
                }, false);
            }
        };
    }

    function removeMatchingItems(list, id) {
        list.items.remove(function(item) {
            return item.props.id() === id;
        });
    }

    function alertBadContent() {
        window.alert('Sorry, that isn\'t a Guardian article!');
    }

    return {
        init: _.once(init)
    };
});
