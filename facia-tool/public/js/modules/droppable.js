import ko from 'knockout';
import _ from 'underscore';
import copiedArticle from 'modules/copied-article';
import alert from 'utils/alert';
import * as draggableElement from 'utils/draggable-element';

function getTargetItem (target, context) {
    context = context || ko.contextFor(target);
    var data = context.$data || {};
    if (!data.drop && context.$parentContext) {
        return getTargetItem(null, context.$parentContext);
    } else {
        return data;
    }
}

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
            source = draggableElement.getItem(event.dataTransfer, sourceGroup);
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

function getListener (name, element) {
    return function (event) {
        listeners[name](element, event);
    };
}

function preventDefaultAction (event) {
    event.preventDefault();
}

function init() {
    window.addEventListener('dragover', preventDefaultAction, false);
    window.addEventListener('drop', preventDefaultAction, false);

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

function dispose() {
    window.removeEventListener('dragover', preventDefaultAction);
    window.removeEventListener('drop', preventDefaultAction);
}

export {
    init,
    listeners,
    dispose
};
