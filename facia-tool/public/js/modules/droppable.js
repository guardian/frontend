import ko from 'knockout';
import _ from 'underscore';
import BaseClass from 'models/base-class';
import copiedArticle from 'modules/copied-article';
import alert from 'utils/alert';
import * as draggableElement from 'utils/draggable-element';
import dispatch from 'utils/drag-dispatcher';
import mediator from 'utils/mediator';

var sourceGroup;
const listeners = Object.freeze({
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
        return dispatch(source, targetItem, targetGroup, !!event.ctrlKey);
    }
});
const imageEditorListeners = Object.freeze({
    drop: function (element, event) {
        var bindingContext = ko.dataFor(event.target);
        event.preventDefault();
        event.stopPropagation();
        bindingContext.dropInEditor(event.dataTransfer);
        bindingContext.underDrag(false);
    },
    dragover: function (element, event) {
        var bindingContext = ko.dataFor(event.target);
        event.preventDefault();
        event.stopPropagation();
        bindingContext.underDrag(true);
    },
    dragleave: function (element, event) {
        var bindingContext = ko.dataFor(event.target);
        event.preventDefault();
        event.stopPropagation();
        bindingContext.underDrag(false);
    },
    dragstart: function (element, event) {
        var bindingContext = ko.dataFor(event.target);
        event.dataTransfer.setData('sourceMeta', JSON.stringify(bindingContext.meta()));
    }
});

export default class Droppable extends BaseClass {
    static get listeners() {
        return listeners;
    }
    static get imageEditor() {
        return imageEditorListeners;
    }

    constructor() {
        super();

        function getListener (name, element) {
            return function (event) {
                listeners[name](element, event);
            };
        }

        function getEditorListener (name, element) {
            return function (event) {
                imageEditorListeners[name](element, event);
            };
        }

        window.addEventListener('dragover', preventDefaultAction, false);
        window.addEventListener('drop', preventDefaultAction, false);
        this.listenOn(mediator, 'drop', (...args) => {
            dispatch(...args);
        });

        ko.bindingHandlers.makeDroppable = {
            init: function (element) {
                for (var eventName in listeners) {
                    element.addEventListener(eventName, getListener(eventName, element), false);
                }
            }
        };
        ko.bindingHandlers.makeDraggable = {
            init: function (element) {
                element.addEventListener('dragstart', getListener('dragstart', element), false);
            }
        };
        ko.bindingHandlers.dropImage = {
            init: function(el, valueAccessor) {
                var isDropEnabled = ko.unwrap(valueAccessor());

                if (isDropEnabled) {
                    for (var eventName in imageEditorListeners) {
                        el.addEventListener(eventName, getEditorListener(eventName, el), false);
                    }
                }
            }
        };
    }

    dispose() {
        super.dispose();
        window.removeEventListener('dragover', preventDefaultAction);
        window.removeEventListener('drop', preventDefaultAction);
    }
}

function getTargetItem (target, context) {
    context = context || ko.contextFor(target);
    var data = context.$data || {};
    if (!data.dropTarget && context.$parentContext) {
        return getTargetItem(null, context.$parentContext);
    } else {
        return data;
    }
}

function preventDefaultAction (event) {
    event.preventDefault();
}
