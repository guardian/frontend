import { getConsentFor } from '@guardian/consent-management-platform';
import { getLocale, loadScript, log } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initial-consent-state';
import config from '../../../lib/config';
import { stub } from './__vendor/ipsos-mori';

const loadIpsosScript = (locale: 'au' | 'uk') => {
	stub();

	const ipsosTag = config.get<string>('page.ipsosTag');
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
	const consentState = await getInitialConsentState();
	const isAU = locale === 'AU' && consentState.aus;
	const isUK = locale === 'GB' && consentState.tcfv2;

	try {
		if (!isAU && !isUK) {
			throw Error('Skipping ipsos process outside GB or AU');
			return;
		}

		if (isAU) {
			void loadIpsosScript('au');
		} else if (isUK) {
			const hasConsent = getConsentFor('ipsos', consentState);
			if (hasConsent) {
				void loadIpsosScript('uk');
			} else {
				throw Error('No consent for ipsos in GB');
			}
		}
	} catch (e) {
		log('commercial', '⚠️ Failed to execute ipsos', e);
	}
};
