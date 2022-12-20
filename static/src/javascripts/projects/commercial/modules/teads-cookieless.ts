import {
	getConsentFor,
	onConsent,
	onConsentChange,
} from '@guardian/consent-management-platform';
import { getCookie, loadScript } from '@guardian/libs';

const initTeadsCookieless = async (): Promise<void> => {
	const consentState = await onConsent();

	const hasConsent = getConsentFor('teads', consentState);

	// Teads only runs on these content types, so lets not give them any more data than necessary
	const allowedContentTypes = ['Article', 'LiveBlog'];

	if (
		hasConsent &&
		window.guardian.config.switches.teadsCookieless &&
		allowedContentTypes.includes(window.guardian.config.page.contentType)
	) {
		window.teads_analytics = window.teads_analytics ?? {};
		window.teads_analytics.analytics_tag_id = 'PUB_2167';
		window.teads_analytics.share =
			window.teads_analytics.share ??
			function (...args) {
				if (window.teads_analytics) {
					(window.teads_analytics.shared_data =
						window.teads_analytics.shared_data ?? []).push(...args);
				}
			};
		await loadScript('https://a.teads.tv/analytics/tag.js', {
			async: false,
		});
	}
};

onConsentChange((consentState) => {
	const hasConsent = getConsentFor('teads', consentState);
	const teadsCookie = getCookie({ name: '_tfpvi' });
	if (!hasConsent && teadsCookie) {
		/*
		Teads sets a cookie called _tfpvi, which is used to track users across sites.
		We need to delete this cookie if the user has not consented to Teads.
		We can't use the @guardian/libs setCookie function here, because it normalizes
		the domain to theguardian.com but the cookie is set on www.theguardian.com
		*/
		document.cookie = '_tfpvi=;path=/';
	}
});

export { initTeadsCookieless };
