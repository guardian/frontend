/* global _: true */
define([
    'knockout',
    'models/group',
    'utils/mediator',
    'utils/parse-query-params'
], function(
    ko,
    Group,
    mediator,
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

                    if (!targetGroup) { return; }

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

                    if (!id) {
                        window.alert('Sorry, you can\'t add that to a front');
                        return;
                    }

                    sourceItem = event.dataTransfer.getData('sourceItem');

                    if (sourceItem) {
                        sourceItem = JSON.parse(sourceItem);
                    } else {
                        sourceItem = {meta: knownQueryParams};
                        sourceGroup = undefined;
                        id = id.split('?')[0] + (_.isEmpty(unknownQueryParams) ? '' : '?' + _.map(unknownQueryParams, function(val, key) {
                            return key + (val ? '=' + val : '');
                        }).join('&'));
                    }

                    // Parse url from links such as http://www.google.co.uk/?param-name=http://www.theguardian.com/foobar
                    _.each(unknownQueryParams, function(val, key) {
                        // Grab the last query param val that looks like a Guardian url
                        if (key === 'url' && (val + '').match(/^http:\/\/www.theguardian.com/)) {
                            id = val;
                        }
                    });

                    mediator.emit('collection:updates', {
                        id: id,
                        sourceItem: sourceItem,
                        sourceGroup: sourceGroup,
                        targetItem: targetItem,
                        targetGroup: targetGroup,
                        isAfter: isAfter
                    });

                }, false);
            }
        };
    }

    return {
        init: _.once(init)
    };
});
