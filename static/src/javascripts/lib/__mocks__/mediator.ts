let events = {};

// eslint-disable-next-line guardian-frontend/no-default-export
export default {
    on(eventName: string, callback: () => void): void {
        events[eventName] = callback;
    },
    once(eventName: string, callback: () => void): void {
        events[eventName] = callback;
    },
    emit(eventName: string, params: Object): void {
        if (events[eventName]) {
            events[eventName](params);
        }
    },
    removeEvent(eventName: string) {
        delete events[eventName];
    },
    removeAllListeners() {
        events = {};
    },
};
