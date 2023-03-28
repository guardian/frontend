/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { removeCookie, setCookie } from '@guardian/libs';
import { getUrlVars } from '../../../lib/url';

/**
 * Set or remove adtest cookie.
 * This is used as a custom targeting parameter in Google Ad Manager
 * in order to test individual line items
 * @returns Promise
 */
const init = (): Promise<void> => {
	const queryParams = getUrlVars();

	if (queryParams.adtest === 'clear') {
		removeCookie({ name: 'adtest' });
	} else if (queryParams.adtest) {
		setCookie({
			name: 'adtest',
			value: encodeURIComponent(queryParams.adtest),
			daysToLive: 10,
		});
	}

	return Promise.resolve();
};

export { init };
