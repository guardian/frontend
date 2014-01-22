/* global _: true */
define([
    'knockout',
    'modules/vars',
    'utils/parse-query-params',
    'utils/url-abs-path',
    'utils/clean-clone',
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
    cleanClone,
    authedAjax,
    Group,
    Article,
    contentApi,
    ophanApi
) {
    var sourceList,
        storage = window.localStorage,
        storageKey ='gu.fronts-tool.drag-source';

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
                    var sourceItem = ko.dataFor(event.target);

                    if (sourceItem.constructor === Article) {
                        storage.setItem(storageKey, JSON.stringify(sourceItem.get()));
                    }
                    sourceList = ko.dataFor(element);
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
                        sourceItem,
                        position,
                        article,
                        groups,
                        insertAt,
                        isAfter = false;

                    event.preventDefault();
                    event.stopPropagation();

                    if (!targetList) { return; }

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
                        } else if (targetList.parentType === 'Collection') {
                            groups = targetList.parent.groups;
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

                    try {
                        sourceItem = JSON.parse(storage.getItem(storageKey));
                    } catch(e) {}

                    storage.removeItem(storageKey);

                    if (!sourceItem || sourceItem.id !== id) {
                        sourceItem = undefined;
                        sourceList = undefined;
                    }

                    removeMatchingItems(targetList, id);

                    insertAt = targetList.items().indexOf(targetItem) + isAfter;
                    insertAt = insertAt === -1 ? targetList.items().length : insertAt;
 
                    article = new Article({
                        id: id,
                        meta: sourceItem ? cleanClone(sourceItem.meta) : undefined,
                        parent: targetList.parent,
                        parentType: targetList.parentType
                    });

                    targetList.items.splice(insertAt, 0, article);

                    contentApi.validateItem(article)
                    .fail(function() {
                        removeMatchingItems(targetList, id);
                        alertBadContent();
                    })
                    .done(function() {
                        var itemMeta;

                        ophanApi.decorateItems([article]);

                        if (_.isFunction(targetList.reflow)) {
                            targetList.reflow();
                        }

                        if (!targetList.parent) { // no need for persistence
                            return;
                        }

                        if (targetList.parentType === 'Article') {
                            targetList.parent.save();
                            return;
                        }
                        
                        if (targetList.parentType !== 'Collection') {
                            return;
                        }

                        itemMeta = sourceItem && sourceItem.meta ? sourceItem.meta : {};

                        if (targetList.parent.groups && targetList.parent.groups.length > 1) {
                            itemMeta.group = targetList.group + '';
                        } else {
                            delete itemMeta.group;
                        }

                        authedAjax.updateCollection(
                            'post',
                            targetList.parent,
                            {
                                item:     id,
                                position: position,
                                after:    isAfter,
                                live:     vars.state.liveMode(),
                                draft:   !vars.state.liveMode(),
                                itemMeta: _.isEmpty(itemMeta) ? undefined : itemMeta
                            }
                        );

                        if (!sourceList || sourceList.keepCopy || sourceList.parentType !== 'Collection') {
                            return;
                        }

                        if (sourceList.parent.id === targetList.parent.id) {
                            return;
                        }

                        removeMatchingItems(sourceList, id);

                        authedAjax.updateCollection(
                            'delete',
                            sourceList.parent,
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
