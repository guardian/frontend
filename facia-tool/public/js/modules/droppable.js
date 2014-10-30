/* global _: true */
define([
    'knockout',
    'modules/copied-article',
    'models/group',
    'utils/mediator',
    'utils/deep-get',
    'utils/parse-query-params'
], function(
    ko,
    copiedArticle,
    Group,
    mediator,
    deepGet,
    parseQueryParams
) {

    function init() {
        var sourceGroup;

        window.addEventListener('dragover', function(event) {
            event.preventDefault();
        },false);

        window.addEventListener('drop', function(event) {
            event.preventDefault();
        },false);

        ko.bindingHandlers.makeDropabble = {
            init: function(element) {

                element.addEventListener('dragstart', function(event) {
                    var sourceItem = ko.dataFor(event.target);

                    if (_.isFunction(sourceItem.get)) {
                        event.dataTransfer.setData('sourceItem', JSON.stringify(sourceItem.get()));
                    }
                    sourceGroup = ko.dataFor(element);
                }, false);

                element.addEventListener('dragover', function(event) {
                    var targetGroup = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target);

                    event.preventDefault();
                    event.stopPropagation();

                    targetGroup.underDrag(targetItem.constructor === Group);
                    _.each(targetGroup.items(), function(item) {
                        var underDrag = (item === targetItem);
                        if (underDrag !== item.state.underDrag()) {
                            item.state.underDrag(underDrag);
                        }
                    });
                }, false);

                element.addEventListener('dragleave', function(event) {
                    var targetGroup = ko.dataFor(element);

                    event.preventDefault();
                    event.stopPropagation();

                    targetGroup.underDrag(false);
                    _.each(targetGroup.items(), function(item) {
                        if (item.state.underDrag()) {
                            item.state.underDrag(false);
                        }
                    });
                }, false);

                element.addEventListener('drop', function(event) {
                    var targetGroup = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target),
                        id = event.dataTransfer.getData('Text'),
                        mediaItem = event.dataTransfer.getData('application/vnd.mediaservice.crops+json'),
                        knownQueryParams = parseQueryParams(id, {
                            namespace: 'gu-',
                            excludeNamespace: false,
                            stripNamespace: true
                        }),
                        unknownQueryParams = parseQueryParams(id, {
                            namespace: 'gu-',
                            excludeNamespace: true
                        }),
                        sourceItem,
                        groups,
                        isAfter = false;

                    event.preventDefault();
                    event.stopPropagation();

                    copiedArticle.flush();

                    if (mediaItem) {
                        try {
                            mediaItem = JSON.parse(mediaItem);
                        } catch(e) {
                            mediaItem = undefined;
                        }

                        if (!mediaItem) {
                            window.alert('Sorry, that image could not be understood.');
                            return;
                        } else {
                            mediaItem = _.chain(mediaItem.assets)
                                .filter(function(asset) { return deepGet(asset, '.dimensions.width') <= 1000; })
                                .sortBy(function(asset) { return deepGet(asset, '.dimensions.width') * -1; })
                                .first()
                                .value();
                        }

                        if (!mediaItem) {
                            window.alert('Sorry, a suitable crop size does not exist for this image');
                            return;
                        }

                    } else if (!targetGroup) {
                        return;

                    } else if (!id) {
                        window.alert('Sorry, you can\'t add that to a front');
                        return;
                    }

                    targetGroup.underDrag(false);
                    _.each(targetGroup.items(), function(item) {
                        item.state.underDrag(false);
                    });

                    // If the item isn't dropped onto an item, assume it's to be appended *after* the other items in this group,
                    if (targetItem.constructor === Group) {
                        targetItem = _.last(targetGroup.items());
                        if (targetItem) {
                            isAfter = true;
                        // or if there arent't any other items, after those in the first preceding group that contains items.
                        } else if (targetGroup.parentType === 'Collection') {
                            groups = targetGroup.parent.groups;
                            for (var i = groups.indexOf(targetGroup) - 1; i >= 0; i -= 1) {
                                targetItem = _.last(groups[i].items());
                                if (targetItem) {
                                    isAfter = true;
                                    break;
                                }
                            }
                        }
                    }

                    sourceItem = event.dataTransfer.getData('sourceItem');

                    if (sourceItem) {
                        sourceItem = JSON.parse(sourceItem);

                    } else if (unknownQueryParams.url) {
                        sourceItem = { id: unknownQueryParams.url };
                        sourceGroup = undefined;

                    } else {
                        sourceItem = {
                            id: id.split('?')[0] + (_.isEmpty(unknownQueryParams) ? '' : '?' + _.map(unknownQueryParams, function(val, key) {
                                return key + (val ? '=' + val : '');
                            }).join('&')),
                            meta: knownQueryParams
                        };
                        sourceGroup = undefined;
                    }

                    mediator.emit('collection:updates', {
                        sourceItem: sourceItem,
                        sourceGroup: sourceGroup,
                        targetItem: targetItem,
                        targetGroup: targetGroup,
                        isAfter: isAfter,
                        mediaItem: mediaItem
                    });

                }, false);
            }
        };
    }

    return {
        init: _.once(init)
    };
});
