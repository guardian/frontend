/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { isInAuOrNz } from '../../../common/modules/commercial/geo-utils';

// nol_t is a global function defined by the IMR worldwide library

const onLoad = (): void => {
	const pvar = {
		cid: 'au-guardian',
		content: '0',
		server: 'secure-gl',
	};

	const trac = window.nol_t(pvar);
	trac.record().post();
};

export const imrWorldwideLegacy = {
	shouldRun: !!window.guardian.config.switches.imrWorldwide && isInAuOrNz(),
	url: '//secure-au.imrworldwide.com/v60.js',
	onLoad,
};
