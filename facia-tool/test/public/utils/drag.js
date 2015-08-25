import _ from 'underscore';
import Droppable from 'modules/droppable';

function Article (element) {
    this.Text = element.querySelector('a').getAttribute('href');
}
function Collection (element) {
    this.Text = element.querySelector('a').getAttribute('href');
}
function Media (assets, origin) {
    this['application/vnd.mediaservice.crops+json'] = JSON.stringify({
        id: 'fake_image_from_media',
        assets: assets
    });
    this['application/vnd.mediaservice.kahuna.uri'] = origin;
}

function Event (extend) {
    this.preventDefault = function () {};
    this.stopPropagation = function () {};
    _.extend(this, extend);
}

function drop (element, target, source, alternate) {
    return Droppable.listeners.drop(element, new Event({
        target: target,
        dataTransfer: {
            getData: function (what) {
                var value = source[what];
                return value || '';
            }
        },
        ctrlKey: !!alternate
    }));
}

function dropInEditor (element, target, source, alternate) {
    return Droppable.imageEditor.drop(element, new Event({
        target: target,
        dataTransfer: {
            getData: function (what) {
                var value = source[what];
                return value || '';
            }
        },
        ctrlKey: !!alternate
    }));
}

function over (element, target) {
    return Droppable.listeners.dragover(element, new Event({
        target: target
    }));
}

function start (element, target, source) {
    return Droppable.listeners.dragstart(element, new Event({
        target: target,
        dataTransfer: {
            setData: function (what, value) {
                source[what] = value;
            }
        }
    }));
}

function leave (element, target) {
    return Droppable.listeners.dragleave(element, new Event({
        target: target
    }));
}

function createDroppable (element) {
    return {
        drop: drop.bind(null, element),
        dragover: over.bind(null, element),
        dragstart: start.bind(null, element),
        dragleave: leave.bind(null, element),
        dropInEditor: dropInEditor.bind(null, element)
    };
}

export default {
    Article,
    Collection,
    Media,
    droppable: createDroppable
};
