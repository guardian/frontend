/* global _: true */
define([
    'knockout',
    'utils/parse-query-params',
    'utils/url-abs-path',
    'utils/remove-by-id',
    'models/group'
], function(
    ko,
    parseQueryParams,
    urlAbsPath,
    removeById,
    Group
) {
    var storage = window.localStorage,
        storageKey ='gu.fronts-tool.drag-source';

    window.addEventListener("dragover", function(event) {
        event.preventDefault();
    },false);

    window.addEventListener("drop", function(event) {
        event.preventDefault();
    },false);

    function droppable(opts) {
        var sourceList;

        ko.bindingHandlers.makeDropabble = {
            init: function(element) {

                element.addEventListener('dragstart', function(event) {
                    var sourceItem = ko.dataFor(event.target);

                    if (_.isFunction(sourceItem.get)) {
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
                        newItem,
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

                    // If the item isn't dropped onto an item, assume it's to be appended *after* the other items in this group,
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

                    position = targetItem && targetItem.id ? targetItem.id : undefined;

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

                    removeById(targetList.items, id);

                    insertAt = targetList.items().indexOf(targetItem) + isAfter;
                    insertAt = insertAt === -1 ? targetList.items().length : insertAt;

                    newItem = opts.newItemConstructor(id, sourceItem, targetList);

                    if (!newItem) {
                        alertBadContent(id);
                        return;
                    }

                    targetList.items.splice(insertAt, 0, newItem);

                    opts.newItemValidator(newItem)
                    .fail(function() {
                        removeById(targetList.items, id);
                        alertBadContent(id);
                    })
                    .done(function() {
                        if (_.isFunction(targetList.reflow)) {
                            targetList.reflow();
                        }

                        if (!targetList.parent) {
                            return;
                        }

                        opts.newItemPersister(newItem, sourceItem, sourceList, targetList, id, position, isAfter);
                    });
                }, false);
            }
        };
    }

    function alertBadContent(id) {
        window.alert('Sorry, but you can\'t add' + (id ? ': ' + id : ' that'));
    }

    return droppable;
});
