import type { RegisterFn } from '../messenger';

const init = (register: RegisterFn): void => {
	register(
		'get-page-url',
		() => window.location.origin + window.location.pathname,
	);
};

export { init };
