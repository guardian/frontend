define([
    'knockout',
    'models/common',
    'models/authedAjax',
    'models/article',
    'models/contentApi',
    'models/ophanApi'
], function(
    ko,
    common,
    authedAjax,
    Article,
    contentApi,
    ophanApi
) {
    var fromList;

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
                    fromList = ko.dataFor(element);
                }, false);

                element.addEventListener('dragover', function(event) {
                    var targetList = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target);

                    event.preventDefault();

                    targetList.underDrag(targetItem.constructor !== Article);
                    _.each(targetList.articles(), function(item) {
                        var underDrag = (item === targetItem);
                        if (underDrag !== item.state.underDrag()) {
                            item.state.underDrag(underDrag);
                        }
                    });
                }, false);

                element.addEventListener('dragleave', function(event) {
                    var targetList = ko.dataFor(element);

                    event.preventDefault();

                    targetList.underDrag(false);
                    _.each(targetList.articles(), function(item) {
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

                    if (!targetList.articles || !targetList.underDrag) { return; }

                    targetList.underDrag(false);
                    _.each(targetList.articles(), function(item) {
                        item.state.underDrag(false);
                    });

                    // If the item isn't dropped onto an article, asssume it's to be appended *after* the other articles in this group,
                    if (targetItem.constructor !== Article) {
                        targetItem = _.last(targetList.articles());
                        if (targetItem) {
                            isAfter = true;
                        // or if there arent't any other articles, after those in the first preceding group that contains articles.
                        } else if (targetList.collection) {
                            var groups = targetList.collection.groups; 
                            for (var i = groups.indexOf(targetList) - 1; i >= 0; i -= 1) {
                                targetItem = _.last(groups[i].articles());
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

                    insertAt = targetList.articles().indexOf(targetItem) + isAfter;
                    insertAt = insertAt === -1 ? targetList.articles().length : insertAt;
 
                    article = new Article({id: item});
                    targetList.articles.splice(insertAt, 0, article)

                    contentApi.validateItem(article)
                    .fail(function() {
                        if (targetList.collection) {
                            targetList.collection.state.loadIsPending(false);
                        }
                        targetList.articles.remove(article);
                        alertBadContent();
                    })
                    .done(function() {
                        ophanApi.decorateItems([article]);

                        if (_.isFunction(targetList.callback)) {
                            targetList.callback();
                        }

                        if (!targetList.collection) { // this is a non-collection list, e.g. a clipboard, so no need for persistence
                            return;
                        }

                        authedAjax.updateCollection(
                            'post',
                            targetList.collection,
                            {
                                item:     item,
                                position: position,
                                after:    isAfter,
                                live:     common.state.liveMode(),
                                draft:   !common.state.liveMode(),
                                itemMeta: {
                                    group: targetList.group + ''
                                }
                            }
                        )

                        if (!fromList || !fromList.collection || fromList.keepCopy) {
                            return;
                        }

                        if (fromList.collection.id === targetList.collection.id) {
                            return;
                        }

                        fromList.collection.state.loadIsPending(true);

                        fromList.articles.remove(function(article) {
                            return article.meta.id() === item;
                        })

                        authedAjax.updateCollection(
                            'delete',
                            fromList.collection,
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
