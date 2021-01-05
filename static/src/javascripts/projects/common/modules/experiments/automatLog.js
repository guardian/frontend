// Entirely temporary

export const automatLog = { url: window.location.href };

export const logAutomatEvent = (event) => {
    automatLog[event.key] = event.value;
};
