// Entirely temporary

type Event = {
	key: string;
	value: unknown;
};

type AutomatLog = Record<string, unknown> & {
	url: string;
};

export const automatLog: AutomatLog = {
	url: window.location.href,
};

export const logAutomatEvent = (event: Event): void => {
	automatLog[event.key] = event.value;
};
