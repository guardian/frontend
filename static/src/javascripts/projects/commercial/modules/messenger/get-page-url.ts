// Should be declared in messenger.ts
export type RegisterListeners = (
	type: string,
	callback?: () => unknown,
	options?: Record<string, unknown>,
) => void;

const init = (register: RegisterListeners): void => {
	register(
		'get-page-url',
		() => window.location.origin + window.location.pathname,
	);
};

export { init };
