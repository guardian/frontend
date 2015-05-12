import $ from 'jquery';
import _ from 'underscore';

var registeredListeners = {};

function handle(event, eventObject) {
    return !_.some(registeredListeners[event], function (handler) {
        // Stop when a callback return false
        return handler.callback.call(handler.scope || this, eventObject) === false;
    });
}

function on(event, callback, scope) {
    if (!registeredListeners[event]) {
        registeredListeners[event] = [];

        (event === 'resize' ? $(window) : $('document, body')).on(event, handle.bind(null, event));
    }
    registeredListeners[event].push({
        callback: callback,
        scope: scope
    });
}

function off(event, callback, scope) {
    if (!registeredListeners[event]) {
        return;
    }
    registeredListeners[event] = _.filter(registeredListeners[event], function (handler) {
        if (callback && callback !== handler.callback) {
            return true;
        } else if (scope && handler.scope !== scope) {
            return true;
        }
        return false;
    });
}

export {
    on,
    off
};
