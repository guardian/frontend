import EventEmitter from 'EventEmitter';
import _ from 'underscore';

var bus = new EventEmitter();

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

bus.scope = function () {
    return new Scope();
};

export default bus;
