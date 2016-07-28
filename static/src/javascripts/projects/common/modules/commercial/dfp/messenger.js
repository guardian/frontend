define([
    'Promise',
    'common/utils/report-error'
], function (Promise, reportError) {
    var currentHost = location.protocol + '//' + location.host;
    var listeners = {};
    var registeredListeners = 0;

    return {
        register: register,
        unregister: unregister
    }

    function register(type, callback) {
        if( registeredListeners === 0 ) {
            on();
        }

        listeners[type] || (listeners[type] = []);
        listeners[type].push(callback);
        registeredListeners += 1;
    }

    function unregister(type, callback) {
        if (callback === undefined) {
            registeredListeners -= listeners[type].length;
            listeners[type].length = 0;
        } else {
            registeredListeners -= 1;
            listeners[type].splice(listeners[type].indexOf(callback), 1);
        }

        if (registeredListeners === 0) {
            off();
        }
    }

    function on() {
        window.addEventListener('message', onMessage);
    }

    function off() {
        window.removeEventListener('message', onMessage);
    }

    function onMessage(event) {
        // We only allow communication with ads created by DFP
        if (event.origin !== currentHost) {
            return;
        }

        try {
            var data = typeof event.data === 'string' ? JSON.parse(event.data) : data;
        } catch( ex ) {
            return;
        }

        // Admittedly the level of verification here is very low and I intend to
        // improve that with some clever cryptographic kung-fu. HAAAAAAaaaaa-yah!
        if (!(data.type && listeners[data.type] && listeners[data.type].length)) {
            // should we keep messages in memory in case listeners are added later on?
            return;
        }

        var promise = listeners[data.type]
        // We offer, but don't impose, the possibility that a listener returns
        // a value that must be sent back to the calling frame. To do this,
        // we pass the cumulated returned value as a second argument to each
        // listener. Notice we don't try some clever way to compose the result
        // value ourselves, this would only make the solution more complex.
        // That means a listener can ignore the cumulated return value and
        // return something else entirely—life is unfair.
        .map(function (listener) {
            return function promiseCallback(ret) {
                var thisRet = listener(data.value, ret);
                return thisRet === undefined ? ret : thisRet;
            }
        })
        // We don't know what each callack will be made of, we don't want to.
        // And so we wrap each call in a promise chain, in case one drops the
        // occasional fastdom bomb in the middle.
        .reduce(function (promise, promiseCallback) {
            return promise.then(promiseCallback);
        }, Promise.resolve(true));

        promise.then(function (response) {
            event.source.postMessage(response, currentHost);
        }).catch(function (ex) {
            reportError(ex, { feature: 'native-ads' });
        });
    }
});
