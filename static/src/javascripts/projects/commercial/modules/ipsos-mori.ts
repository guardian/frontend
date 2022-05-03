import { getConsentFor } from '@guardian/consent-management-platform';
import { getLocale, loadScript, log } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initial-consent-state';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { ipsosMoriAustralia } from 'common/modules/experiments/tests/ipsos-mori-australia';
import config from '../../../lib/config';
import { stub } from './__vendor/ipsos-mori';

const loadIpsosScript = (locale?: string) => {
	stub();

	const ipsosTag = config.get<string>('page.ipsosTag');
	if (ipsosTag === undefined) throw Error('Ipsos tag undefined');
	const dotmetricsLocation = !!locale && locale === 'AU' ? 'au' : 'uk';

	const ipsosSource = `https://${dotmetricsLocation}-script.dotmetrics.net/door.js?d=${document.location.host}&t=${ipsosTag}`;

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
export const init = (): Promise<void> => {
	const forceIpsosMoriAustraliaTest = isInVariantSynchronous(
		ipsosMoriAustralia,
		'variant',
	);

	return getLocale()
		.then((locale) => {
			if (locale === 'GB') {
				return getInitialConsentState();
			} else if (locale === 'AU' && forceIpsosMoriAustraliaTest) {
				// Skipping consent step for Australia in 0% test
				void loadIpsosScript(locale);
			} else {
				throw Error('Skipping ipsos process outside GB or AU');
			}
		})
		.then((state) => {
			if (!!state && getConsentFor('ipsos', state)) {
				void loadIpsosScript();
			} else {
				throw Error('No consent for ipsos');
			}
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute ipsos', e);
		});
};
