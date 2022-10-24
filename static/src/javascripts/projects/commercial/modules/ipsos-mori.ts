import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import { getLocale, loadScript, log } from '@guardian/libs';
import { stub } from './__vendor/ipsos-mori';

const loadIpsosScript = (locale: 'au' | 'uk') => {
	stub();

	const ipsosTag = window.guardian.config.page.ipsosTag;
	if (ipsosTag === undefined) throw Error('Ipsos tag undefined');

	const ipsosSource = `https://${locale}-script.dotmetrics.net/door.js?d=${document.location.host}&t=${ipsosTag}`;

	return loadScript(ipsosSource, {
		id: 'ipsos',
		async: true,
		type: 'text/javascript',
	});
};

/**
 * Initialise Ipsos Mori - market research partner
 * documentation on DCR: [link](https://github.com/guardian/dotcom-rendering/blob/150fc2d81e6a66d9c3336185e874fc8cd0288546/dotcom-rendering/docs/architecture/3rd%20party%20technical%20review/002-ipsos-mori.md)
 * @returns Promise
 */
export const init = async (): Promise<void> => {
	const locale = await getLocale();
	const consentState = await onConsent();
	const isAU = locale === 'AU' && !!consentState.aus;
	const isUK = locale === 'GB' && !!consentState.tcfv2;

	if (!isAU && !isUK) {
		log('commercial', 'Skipping ipsos process outside GB or AU');
	}

	if (isAU) {
		void loadIpsosScript('au');
	} else if (isUK) {
		const hasConsent = getConsentFor('ipsos', consentState);
		if (hasConsent) {
			void loadIpsosScript('uk');
		} else {
			log('commercial', 'No consent for ipsos in GB');
		}
	}
};
