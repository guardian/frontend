// TODO: write some tests and convert to TypeScript
window.eventHistory = window.eventHistory || {};

export default {
    on: (eventName, callback) => {
        document.addEventListener(eventName, callback);

        if (window.eventHistory[eventName]) {
            window.eventHistory[eventName].forEach(payload => {
                callback(new CustomEvent(eventName, { detail: payload }))
            })
        }
    },
    emit: (eventName, payload) => {
        const event = new CustomEvent(eventName, {
            detail: payload, 
        });

        document.dispatchEvent(event)

        // Stash this away for anyone who joins later
        window.eventHistory[eventName] = [...(window.eventHistory[eventName] || []), payload];
    }
}
