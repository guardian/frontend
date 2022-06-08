import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import { loadScript, log } from '@guardian/libs';
import { once } from 'lodash-es';
import config from '../../../lib/config';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';

const comscoreSrc = '//sb.scorecardresearch.com/cs/6035250/beacon.js';
const comscoreC1 = '2';
const comscoreC2 = '6035250';

const getGlobals = (keywords: string): ComscoreGlobals => {
	const globals: ComscoreGlobals = {
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
	window._comscore = window._comscore ?? [];
	window._comscore.push(getGlobals(config.get('page.keywords', '')));

	return loadScript(comscoreSrc, { id: 'comscore', async: true });
};

/**
 * Initialise comscore, industry-wide audience tracking
 * https://www.comscore.com/About
 */
const setupComscore = async (): Promise<void> => {
	if (!commercialFeatures.comscore) {
		return Promise.resolve();
	}
	try {
		const consentState = await onConsent();
		/* Rule is that comscore can run:
		- in Tcfv2: Based on consent for comscore
		- in Australia: Always
		- in CCPA: If the user hasn't chosen Do Not Sell
		TODO move this logic to getConsentFor
		*/
		const canRunTcfv2 =
			consentState.tcfv2 && getConsentFor('comscore', consentState);
		const canRunAus = !!consentState.aus;
		const canRunCcpa = !!consentState.ccpa && !consentState.ccpa.doNotSell;

		if (!(canRunTcfv2 || canRunAus || canRunCcpa)) {
			throw Error('No consent for comscore');
		}
		await initOnConsent();
		return;
	} catch (e) {
		log('commercial', '⚠️ Failed to execute comscore', e);
	}
};

const setupComscoreOnce = once(setupComscore);

export const init = (): Promise<void> => setupComscoreOnce();

export const _ = {
	getGlobals,
	setupComscore,
	comscoreSrc,
	comscoreC1,
	comscoreC2,
};
