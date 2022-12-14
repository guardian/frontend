import type { RegisterListener } from '@guardian/commercial/core';

const init = (register: RegisterListener): void => {
	register(
		'get-page-url',
		() => window.location.origin + window.location.pathname,
	);
};

export { init };
