import type { RegisterListener } from '../messenger';

const init = (register: RegisterListener): void => {
	register(
		'get-page-url',
		() => window.location.origin + window.location.pathname,
	);
};

export { init };
