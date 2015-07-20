import EventEmitter from 'EventEmitter';

var listeners = Symbol();
var subscriptions = Symbol();

export default class BaseClass extends EventEmitter {
    constructor() {
        super();
        this[listeners] = [];
        this[subscriptions] = [];
    }

    subscribeOn(observable, callback) {
        this[subscriptions].push(observable.subscribe(callback.bind(this)));
    }

    listenOn(emitter, event, callback) {
        this[listeners].push({ emitter, event, callback });
        emitter.on(event, callback);
    }

    dispose() {
        if (this[subscriptions]) {
            this[subscriptions].forEach(subscriber => {
                subscriber.dispose();
            });
            delete this[subscriptions];
        }
        if (this[listeners]) {
            this[listeners].forEach(({ emitter, event, callback }) => {
                emitter.off(event, callback);
            });
            delete this[listeners];
        }
    }
}
