define([
    'EventEmitter'
], function (
    EventEmitter
) {
    var bus = new EventEmitter(),
        registeredListeners = {};

    function registerListener (event, callback) {
        if (!registeredListeners[event]) {
            registeredListeners[event] = function (eventObject) {
                bus.emit(event, eventObject);
            };

            (event === 'resize' ? $(window) : $('document, body')).on(event, registeredListeners[event]);
        }
        bus.on(event, callback);
    }

    return {
        on: registerListener
    };
});
