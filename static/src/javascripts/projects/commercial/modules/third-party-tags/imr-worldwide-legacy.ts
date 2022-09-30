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
