// @flow
import { trackNativeAdLinkClick } from 'common/modules/analytics/google';
import type { RegisterListeners } from 'commercial/modules/messenger';

const sendClick = (adSlot: Element, linkName: string): void => {
    trackNativeAdLinkClick(adSlot.id, linkName);
};

const init = (register: RegisterListeners): void => {
    register('click', (linkName, ret, iframe = {}) =>
        sendClick(
            iframe.closest('.js-ad-slot') || {
                id: 'unknown',
            },
            linkName || ''
        )
    );
};

export { init };

export const _ = { sendClick };
