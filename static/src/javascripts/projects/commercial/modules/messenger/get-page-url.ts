import type { RegisterListeners } from '../messenger';

const init = (register: RegisterListeners): void => {
	register(
		'get-page-url',
		() => window.location.origin + window.location.pathname,
	);
};

export { init };
