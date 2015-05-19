var allListenersMap = new Map();

class BaseWidget {
    subscribeOn(observable, callback) {
        var listeners = allListenersMap.get(this);
        if (!listeners) {
            listeners = [];
        }
        listeners.push(observable.subscribe(callback.bind(this)));
        allListenersMap.set(this, listeners);
    }

    dispose() {
        var listeners = allListenersMap.get(this);
        if (listeners && listeners.length) {
            listeners.forEach(function (subscriber) {
                subscriber.dispose();
            });
        }
    }
}

export default BaseWidget;
