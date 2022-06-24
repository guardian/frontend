import type { AdSize } from '@guardian/commercial-core';

export const toGoogleTagSize = (size: AdSize): AdSize | 'fluid' => {
	return size.width === 0 && size.height === 0 ? 'fluid' : size;
};
