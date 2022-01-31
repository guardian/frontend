import type { RegisterListener } from '../messenger';

const init = (register: RegisterListener): void => {
	register(
		'get-page-targeting',
		() => window.guardian.config.page.sharedAdTargeting,
	);
};

export { init };
