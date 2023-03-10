/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated
 */

import type { AdSize } from '@guardian/commercial-core';

export const toGoogleTagSize = (size: AdSize): googletag.SingleSize => {
	// not using width and height here as to maintain compatibility with plain arrays
	return size[0] === 0 && size[1] === 0 ? 'fluid' : [size[0], size[1]];
};
