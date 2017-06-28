// @flow
import { trackNativeAdLinkClick } from 'common/modules/analytics/google';

const sendClick = (adSlot: Element, linkName: string): void => {
    trackNativeAdLinkClick(adSlot.id, linkName);
};

export { sendClick };
