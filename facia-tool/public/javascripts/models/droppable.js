define([
    'knockout',
    'models/common',
    'models/authedAjax',
    'models/group',
    'models/article',
    'models/contentApi',
    'models/ophanApi'
], function(
    ko,
    common,
    authedAjax,
    Group,
    Article,
    contentApi,
    ophanApi
) {
    var sourceList,
        sourceItem;

    function init() {

        init = function() {}; // make idempotent

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

                    console.log(targetList);
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
                        item = event.testData ? event.testData : event.dataTransfer.getData('Text'),
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
                            var groups = targetList.collection.groups; 
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

                    _.each(common.util.parseQueryParams(item), function(url){
                        if (url && url.match(/^http:\/\/www.theguardian.com/)) {
                            item = url;
                        }
                    });

                    item = common.util.urlAbsPath(item);

                    if (!item) { 
                        alertBadContent();
                        return;
                    }

                    if (targetList.collection) {
                        targetList.collection.state.loadIsPending(true);
                    }

                    // sourceItem doesn't exist when the drag was from an arbitrary link elsewhere.
                    // garbage collect it, if it's a leftover from a previous drag. 
                    if(sourceItem && sourceItem.props.id() !== item) {
                        sourceItem = undefined;
                    }

                    insertAt = targetList.items().indexOf(targetItem) + isAfter;
                    insertAt = insertAt === -1 ? targetList.items().length : insertAt;
 
                    article = new Article({
                        id: item,
                        meta: sourceItem ? sourceItem.getMeta() : undefined
                    });

                    // just for UI
                    targetList.items.splice(insertAt, 0, article)

                    contentApi.validateItem(article)
                    .fail(function() {
                        if (targetList.collection) {
                            targetList.collection.state.loadIsPending(false);
                        }
                        targetList.items.remove(article);
                        alertBadContent();
                    })
                    .done(function() {
                        var itemMeta;

                        ophanApi.decorateItems([article]);

                        if (_.isFunction(targetList.callback)) {
                            targetList.callback();
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
                                item:     item,
                                position: position,
                                after:    isAfter,
                                live:     common.state.liveMode(),
                                draft:   !common.state.liveMode(),
                                itemMeta: itemMeta
                            }
                        )

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
                        })

                        authedAjax.updateCollection(
                            'delete',
                            sourceList.collection,
                            {
                                item:   item,
                                live:   common.state.liveMode(),
                                draft: !common.state.liveMode()
                            }
                        )
                    });
                }, false);
            }
        };
    };

    function alertBadContent() {
        window.alert('Sorry, that isn\'t a Guardian article!')
    }

    return {
        init: init
    };
});
