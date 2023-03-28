/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import type { RegisterListener } from '@guardian/commercial-core';

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
