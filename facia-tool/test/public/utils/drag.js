import _ from 'underscore';
import droppable from 'modules/droppable';

function Article (element) {
    this.Text = element.querySelector('a').getAttribute('href');
}
function Collection (element) {
    this.Text = element.querySelector('a').getAttribute('href');
}

function Event (extend) {
    this.preventDefault = function () {};
    this.stopPropagation = function () {};
    _.extend(this, extend);
}

function drop (element, target, source) {
    droppable.listeners.drop(element, new Event({
        target: target,
        dataTransfer: {
            getData: function (what) {
                var value = source[what];
                return value || '';
            }
        }
    }));
}

function over (element, target) {
    droppable.listeners.dragover(element, new Event({
        target: target
    }));
}

function start (element, target, source) {
    droppable.listeners.dragstart(element, new Event({
        target: target,
        dataTransfer: {
            setData: function (what, value) {
                source[what] = value;
            }
        }
    }));
}

function leave (element, target) {
    droppable.listeners.dragleave(element, new Event({
        target: target
    }));
}

function createDroppable (element) {
    return {
        drop: function (target, source) {
            drop(element, target, source);
        },
        dragover: function (target, source) {
            over(element, target, source);
        },
        dragstart: function (target, source) {
            start(element, target, source);
        },
        dragleave: function (target, source) {
            leave(element, target, source);
        }
    };
}

export default {
    Article: Article,
    Collection: Collection,
    droppable: createDroppable
};
