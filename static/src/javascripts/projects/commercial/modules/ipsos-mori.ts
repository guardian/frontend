import { getConsentFor } from '@guardian/consent-management-platform';
import { getLocale, loadScript, log } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initial-consent-state';
import config from '../../../lib/config';
import { stub } from './__vendor/ipsos-mori';

const loadIpsosScript = () => {
	stub();

	const ipsosTag = config.get<string>('page.ipsosTag');
	if (ipsosTag === undefined) throw Error('Ipsos tag undefined');

	const ipsosSource = `https://uk-script.dotmetrics.net/door.js?d=${document.location.host}&t=${ipsosTag}`;

	return loadScript(ipsosSource, {
		id: 'ipsos',
		async: true,
		type: 'text/javascript',
	});
};

/**
 * Initialise Ipsos Mori - market research partner
 * documentation on DCR: https://git.io/J9c6g
 * @returns Promise
 */
export const init = (): Promise<void> =>
	getLocale()
		.then((locale) => {
			if (locale === 'GB') {
				return getInitialConsentState();
			} else {
				throw Error('Skipping ipsos outside of GB');
			}
		})
		.then((state) => {
			if (getConsentFor('ipsos', state)) {
				void loadIpsosScript();
			} else {
				throw Error('No consent for ipsos');
			}
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute ipsos', e);
		});
