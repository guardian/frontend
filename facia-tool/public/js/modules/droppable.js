define([
    'knockout',
    'underscore',
    'modules/copied-article',
    'utils/alert',
    'utils/draggable-element'
], function(
    ko,
    _,
    copiedArticle,
    alert,
    draggableElement
) {
    var sourceGroup;
    var listeners = {
        dragstart: function (element, event) {
            var sourceItem = ko.dataFor(event.target);

            if (_.isFunction(sourceItem.get)) {
                event.dataTransfer.setData('sourceItem', JSON.stringify(sourceItem.get()));
            }
            sourceGroup = ko.dataFor(element);
        },
        dragover: function (element, event) {
            var targetGroup = ko.dataFor(element),
                targetItem = getTargetItem(event.target);

            event.preventDefault();
            event.stopPropagation();

            targetGroup.setAsTarget(targetItem, !!event.ctrlKey);
        },
        dragleave: function (element, event) {
            var targetGroup = ko.dataFor(element);

            event.preventDefault();
            event.stopPropagation();

            targetGroup.unsetAsTarget();
        },
        drop: function (element, event) {
            var targetGroup = ko.dataFor(element),
                targetItem = getTargetItem(event.target),
                source;

            if (!targetGroup) {
                return;
            }

            try {
                source = draggableElement(event.dataTransfer, sourceGroup);
            } catch (ex) {
                targetGroup.unsetAsTarget();
                alert(ex.message);
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            copiedArticle.flush();

            targetGroup.unsetAsTarget();
            targetItem.drop(source, targetGroup, !!event.ctrlKey);
        }
    };

    function getTargetItem (target, context) {
        context = context || ko.contextFor(target);
        var data = context.$data || {};
        if (!data.drop && context.$parentContext) {
            return getTargetItem(null, context.$parentContext);
        } else {
            return data;
        }
    }

    function getListener (name, element) {
        return function (event) {
            listeners[name](element, event);
        };
    }

    function init() {
        window.addEventListener('dragover', function(event) {
            event.preventDefault();
        },false);

        window.addEventListener('drop', function(event) {
            event.preventDefault();
        },false);

        ko.bindingHandlers.makeDroppable = {
            init: function(element) {
                for (var eventName in listeners) {
                    element.addEventListener(eventName, getListener(eventName, element), false);
                }
            }
        };
        ko.bindingHandlers.makeDraggable = {
            init: function(element) {
                element.addEventListener('dragstart', getListener('dragstart', element), false);
            }
        };
    }

    return {
        init: _.once(init),
        listeners: listeners
    };
});
