import {
	getConsentFor,
	onConsentChange,
} from '@guardian/consent-management-platform';
import { getLocale, loadScript } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initialConsentState';
import config from '../../../lib/config';
import { log } from '@guardian/libs';

const loadIpsosScript = () => {
	window.dm = window.dm || { AjaxData: [] };
	window.dm.AjaxEvent = (et, d, ssid, ad) => {
		dm.AjaxData.push({ et, d, ssid, ad }); // eslint-disable-line no-undef
		if (window.DotMetricsObj) {
			DotMetricsObj.onAjaxDataUpdate(); // eslint-disable-line no-undef
		}
	};
	const ipsosSource = `https://uk-script.dotmetrics.net/door.js?d=${
		document.location.host
	}&t=${config.get('page.ipsosTag')}`;

	return loadScript(ipsosSource, {
		id: 'ipsos',
		async: true,
		type: 'text/javascript',
	});
};

export const init = () => {
	return getLocale()
		.then((locale) => {
			if (locale === 'GB') {
				return getInitialConsentState();
			} else {
				throw Error('Skipping ipsos outside of GB');
			}
		})
		.then((state) => {
			if (getConsentFor('ipsos', state)) {
				return loadIpsosScript();
			} else {
				throw Error('No consent for ipsos');
			}
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute ipsos', e);
		});
};
