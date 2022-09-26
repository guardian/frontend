import config from '../../../../lib/config';
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
	shouldRun:
		config.get<boolean>('switches.imrWorldwide', false) && isInAuOrNz(),
	url: '//secure-au.imrworldwide.com/v60.js',
	onLoad,
};
