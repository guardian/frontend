import {
	getConsentFor,
	onConsent,
	onConsentChange,
} from '@guardian/consent-management-platform';
import { loadScript, setCookie } from '@guardian/libs';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { teadsCookieless as teadsCookielessTest } from 'common/modules/experiments/tests/teads-cookieless';

const initTeadsCookieless = async (): Promise<void> => {
	const consentState = await onConsent();

	const hasConsent = getConsentFor('teads', consentState);

	if (
		hasConsent &&
		window.guardian.config.switches.teadsCookieless &&
		isInVariantSynchronous(teadsCookielessTest, 'variant')
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

	if (!hasConsent) {
		setCookie({ name: '_tfpvi', value: '' });
	}
});

export { initTeadsCookieless };
