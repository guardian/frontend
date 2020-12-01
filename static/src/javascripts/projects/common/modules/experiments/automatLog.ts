// Entirely temporary
type Event = { key: string; value: any };

export const automatLog = { url: window.location.href };

export const logAutomatEvent = (event: Event): void => {
    automatLog[event.key] = event.value;
};
