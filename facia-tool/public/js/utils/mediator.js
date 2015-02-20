define([
    'EventEmitter',
    'underscore'
], function(
    EventEmitter,
    _
) {
    var bus = new EventEmitter();

    bus.scope = function () {
        return new Scope();
    };

    function Scope () {
        this.listeners = [];
    }

    Scope.prototype.on = function(event, callback) {
        this.listeners.push([event, callback]);
        return bus.on(event, callback);
    };

    Scope.prototype.dispose = function () {
        _.each(this.listeners, function (pair) {
            bus.off(pair[0], pair[1]);
        });
    };

    return bus;
});
