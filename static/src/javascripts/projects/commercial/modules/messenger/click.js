import { trackNativeAdLinkClick } from 'common/modules/analytics/google';

const sendClick = (adSlot, linkName) => {
    trackNativeAdLinkClick(adSlot.id, linkName);
};

const init = (register) => {
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
