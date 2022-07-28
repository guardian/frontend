import config from 'lib/config';
import { cmp } from '@guardian/consent-management-platform';
import { getPrivacyFramework } from 'lib/getPrivacyFramework';

export const addPrivacySettingsLink = () => {
	if (!config.get('switches.consentManagement', true)) {
		return;
	}

	const privacyLink = document.querySelector('a[data-link-name=privacy]');

	if (privacyLink) {
		const privacyLinkListItem = privacyLink.parentElement;

		if (privacyLinkListItem) {
			const newPrivacyLink = privacyLink.cloneNode(false);

			newPrivacyLink.dataset.linkName = 'privacy-settings';
			newPrivacyLink.removeAttribute('href');
			newPrivacyLink.innerText = getPrivacyFramework().ccpa
				? 'California resident – Do Not Sell'
				: 'Privacy settings';

			const newPrivacyLinkListItem = privacyLinkListItem.cloneNode(false);

			newPrivacyLinkListItem.appendChild(newPrivacyLink);

			privacyLinkListItem.insertAdjacentElement(
				'beforebegin',
				newPrivacyLinkListItem,
			);

			newPrivacyLink.addEventListener('click', () => {
				cmp.showPrivacyManager();
			});
		}
	}
};

export const cmpBannerCandidate = {
	id: 'cmpUi',
	canShow: () => {
		if (!config.get('switches.cmp', true)) return Promise.resolve(false);
		return cmp.willShowPrivacyMessage();
	},
	// Remote banner is injected first: show() always resolves to `true`
	show: () => Promise.resolve(true),
};
