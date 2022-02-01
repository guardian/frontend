import type { RegisterListener } from '../messenger';

/**
 * Register a listener for iframes to request shared ad targeting
 *
 * Allows for ads to be served into SafeFrame whilst retaining the ability to define a passback
 */
const init = (register: RegisterListener): void => {
	register(
		'get-page-targeting',
		() => window.guardian.config.page.sharedAdTargeting,
	);
};

export { init };
