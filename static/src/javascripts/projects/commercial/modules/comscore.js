import { getConsentFor } from '@guardian/consent-management-platform';
import { loadScript } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initialConsentState';
import config from '../../../lib/config';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';

/**
 * Industry-wide audience tracking
 * https://www.comscore.com/About
 */

const comscoreSrc = '//sb.scorecardresearch.com/cs/6035250/beacon.js';
const comscoreC1 = '2';
const comscoreC2 = '6035250';

let initialised = false;

const getGlobals = (consentState, keywords) => {
	const globals = {
		c1: comscoreC1,
		c2: comscoreC2,
		cs_ucfr: consentState ? '1' : '0',
	};

	if (keywords !== 'Network Front') {
		globals.comscorekw = keywords;
	}

	return globals;
};

const initOnConsent = (state) => {
	if (!initialised) {
		// eslint-disable-next-line no-underscore-dangle
		window._comscore = window._comscore || [];

		// eslint-disable-next-line no-underscore-dangle
		window._comscore.push(
			getGlobals(!!state, config.get('page.keywords', '')),
		);

		loadScript(comscoreSrc, { id: 'comscore', async: true });

		initialised = true;
	}
};

export const init = () => {
	if (commercialFeatures.comscore) {
		void getInitialConsentState().then((state) => {
			/* Rule is that comscore can run:
                - in Tcfv2: Based on consent for comscore
                - in Australia: Always
                - in CCPA: If the user hasn't chosen Do Not Sell
            */
			const canRunTcfv2 = state.tcfv2 && getConsentFor('comscore', state);
			const canRunAus = !!state.aus;
			const canRunCcpa = !!state.ccpa && !state.ccpa.doNotSell;

			if (canRunTcfv2 || canRunAus || canRunCcpa) initOnConsent(true);
		});
	}

	return Promise.resolve();
};

export const _ = {
	getGlobals,
	initOnConsent,
	resetInit: () => {
		initialised = false;
	},
	comscoreSrc,
	comscoreC1,
	comscoreC2,
};
