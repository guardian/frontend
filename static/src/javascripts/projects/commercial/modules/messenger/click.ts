import { isString } from '@guardian/libs';
import { trackNativeAdLinkClick } from '../../../common/modules/analytics/google';
import type { RegisterListener } from '../messenger';

const sendClick = (adSlot: { id: string }, linkName: string): void => {
	trackNativeAdLinkClick(adSlot.id, linkName);
};

const init = (register: RegisterListener): void => {
	register('click', (linkName, ret, iframe) =>
		sendClick(
			iframe?.closest('.js-ad-slot') ?? {
				id: 'unknown',
			},
			isString(linkName) ? linkName : '',
		),
	);
};

export { init };
