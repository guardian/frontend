let events = {};

// eslint-disable-next-line guardian-frontend/no-default-export
export default {
    on(eventName, callback) {
        events[eventName] = callback;
    },
    once(eventName, callback) {
        events[eventName] = callback;
    },
    emit(eventName, params) {
        if (events[eventName]) {
            events[eventName](params);
        }
    },
    removeEvent(eventName) {
        delete events[eventName];
    },
    removeAllListeners() {
        events = {};
    },
};
