// @flow
import { trackNativeAdLinkClick } from 'common/modules/analytics/google';
import { register } from 'commercial/modules/messenger';

const sendClick = (adSlot: Element, linkName: string): void => {
    trackNativeAdLinkClick(adSlot.id, linkName);
};

register('click', (linkName, ret, iframe = {}) =>
    sendClick(
        iframe.closest('.js-ad-slot') || {
            id: 'unknown',
        },
        linkName || ''
    )
);

export { sendClick };
