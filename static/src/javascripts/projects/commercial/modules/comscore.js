import { getConsentFor } from '@guardian/consent-management-platform';
import { loadScript, log } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initialConsentState';
import config from '../../../lib/config';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { once } from 'lodash-es';

const comscoreSrc = '//sb.scorecardresearch.com/cs/6035250/beacon.js';
const comscoreC1 = '2';
const comscoreC2 = '6035250';

let initialised = false;

const getGlobals = (keywords) => {
	const globals = {
		c1: comscoreC1,
		c2: comscoreC2,
		cs_ucfr: '1',
	};

	if (keywords !== 'Network Front') {
		globals.comscorekw = keywords;
	}

	return globals;
};

const initOnConsent = () => {
	// eslint-disable-next-line no-underscore-dangle
	window._comscore = window._comscore || [];

	// eslint-disable-next-line no-underscore-dangle
	window._comscore.push(getGlobals(config.get('page.keywords', '')));

	return loadScript(comscoreSrc, { id: 'comscore', async: true });
};

const setupComscore = () => {
	if (commercialFeatures.comscore) {
		return getInitialConsentState()
			.then((state) => {
				/* Rule is that comscore can run:
                - in Tcfv2: Based on consent for comscore
                - in Australia: Always
                - in CCPA: If the user hasn't chosen Do Not Sell
                */
				const canRunTcfv2 =
					state.tcfv2 && getConsentFor('comscore', state);
				const canRunAus = !!state.aus;
				const canRunCcpa = !!state.ccpa && !state.ccpa.doNotSell;

				if (!(canRunTcfv2 || canRunAus || canRunCcpa)) {
					return Promise.reject('No consent for comscore');
				}
				return initOnConsent();
			})
			.catch((e) => {
				log('commercial', '⚠️ Failed to execute comscore', e);
			});
	}
	return Promise.resolve();
};

const setupComscoreOnce = once(setupComscore);

export const init = () => {
	return setupComscoreOnce();
};

export const _ = {
	getGlobals,
	setupComscore,
	comscoreSrc,
	comscoreC1,
	comscoreC2,
};
