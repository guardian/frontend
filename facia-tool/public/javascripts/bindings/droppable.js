define([
    'knockout',
    'modules/vars',
    'modules/utils',
    'modules/authed-ajax',
    'models/article',
    'modules/content-api',
    'modules/ophan-api'
], function(
    ko,
    vars,
    utils,
    authedAjax,
    Article,
    contentApi,
    ophanApi
) {
    var sourceList,
        sourceArticle;

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
                    sourceArticle = ko.dataFor(event.target);
                }, false);

                element.addEventListener('dragover', function(event) {
                    var targetList = ko.dataFor(element),
                        targetArticle = ko.dataFor(event.target);

                    event.preventDefault();

                    targetList.underDrag(targetArticle.constructor !== Article);
                    _.each(targetList.articles(), function(item) {
                        var underDrag = (item === targetArticle);
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
                        targetArticle = ko.dataFor(event.target),
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
                    if (targetArticle.constructor !== Article) {
                        targetArticle = _.last(targetList.articles());
                        if (targetArticle) {
                            isAfter = true;
                        // or if there arent't any other articles, after those in the first preceding group that contains articles.
                        } else if (targetList.collection) {
                            var groups = targetList.collection.groups;
                            for (var i = groups.indexOf(targetList) - 1; i >= 0; i -= 1) {
                                targetArticle = _.last(groups[i].articles());
                                if (targetArticle) {
                                    isAfter = true;
                                    break;
                                }
                            }
                        }
                    }

                    position = targetArticle && targetArticle.props ? targetArticle.props.id() : undefined;

                    _.each(utils.parseQueryParams(item), function(url){
                        if (url && url.match(/^http:\/\/www.theguardian.com/)) {
                            item = url;
                        }
                    });

                    item = utils.urlAbsPath(item);

                    if (!item) {
                        alertBadContent();
                        return;
                    }

                    if (targetList.collection) {
                        targetList.collection.state.loadIsPending(true);
                    }

                    // sourceArticle doesn't exist when the drag was from an arbitrary link elsewhere.
                    // garbage collect it, if it's a leftover from a previous drag.
                    if(sourceArticle && sourceArticle.props.id() !== item) {
                        sourceArticle = undefined;
                    }

                    insertAt = targetList.articles().indexOf(targetArticle) + isAfter;
                    insertAt = insertAt === -1 ? targetList.articles().length : insertAt;

                    article = new Article({
                        id: item,
                        meta: sourceArticle ? sourceArticle.getMeta() : undefined
                    });

                    // just for UI
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
                        var itemMeta;

                        ophanApi.decorateItems([article]);

                        if (_.isFunction(targetList.callback)) {
                            targetList.callback();
                        }

                        if (!targetList.collection) { // this is a non-collection list, e.g. a clipboard, so no need for persistence
                            return;
                        }

                        itemMeta = sourceArticle ? sourceArticle.getMeta() : {};
                        itemMeta.group = targetList.group + '';

                        authedAjax.updateCollection(
                            'post',
                            targetList.collection,
                            {
                                item:     item,
                                position: position,
                                after:    isAfter,
                                live:     vars.state.liveMode(),
                                draft:   !vars.state.liveMode(),
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
                        sourceList.articles.remove(function(article) {
                            return article === sourceArticle;
                        })

                        authedAjax.updateCollection(
                            'delete',
                            sourceList.collection,
                            {
                                item:   item,
                                live:   vars.state.liveMode(),
                                draft: !vars.state.liveMode()
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
