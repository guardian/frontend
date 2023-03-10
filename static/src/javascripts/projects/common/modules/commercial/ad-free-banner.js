/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated
 */

import checkIcon from 'svgs/icon/tick.svg';
import config from '../../../../lib/config';
import { hasUserAcknowledgedBanner, Message } from '../ui/message';
import { isAdFreeUser } from './user-features';

const messageCode = 'ad-free-banner';
const image = config.get('images.acquisitions.ad-free', '');

const isInExperiment = () => config.get('switches.scAdFreeBanner', false);

const hideBanner = (banner) => {
	banner.acknowledge();
};

const canShow = () =>
	Promise.resolve(
		!hasUserAcknowledgedBanner(messageCode) &&
			isAdFreeUser() &&
			isInExperiment(),
	);

const show = () => {
	new Message(messageCode, {
		siteMessageLinkName: messageCode,
		siteMessageCloseBtn: 'hide',
		trackDisplay: true,
		cssModifierClass: messageCode,
		customJs() {
			const dismissButton = document.querySelector(
				'.js-ad-free-banner-dismiss-button',
			);
			dismissButton?.addEventListener('click', () => hideBanner(this));
		},
	}).show(`
        <div class="site-message__copy-text">
            <h2 class="site-message__copy-heading">No ads, no interruptions</h2>
            <p>As a valued subscriber, you won’t see adverts while logged in to the Guardian. Thank you for your support.</p>
            <button data-link-name="ad-free-banner : dismiss" class="button site-message__copy-button js-ad-free-banner-dismiss-button">
                ${checkIcon.markup} Got it, thanks
            </button>
        </div>
        <div class="site-message__image">
            <img src="${image}" alt="" />
        </div>
    `);
	return Promise.resolve(true);
};

const adFreeBanner = {
	id: messageCode,
	show,
	canShow,
};

export { adFreeBanner };
