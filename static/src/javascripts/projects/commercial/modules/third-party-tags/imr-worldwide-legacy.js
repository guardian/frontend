// @flow
import config from 'lib/config';

const onLoad = () => {
    const pvar = {
        cid: 'au-guardian',
        content: '0',
        server: 'secure-gl',
    };
    // nol_t is a global function set by the imrworldwide library
    // eslint-disable-next-line no-undef
    const trac = nol_t(pvar);
    trac.record().post();
};

// The Nielsen NetRatings tag. Also known as IMR worldwide.
const url: string = '//secure-au.imrworldwide.com/v60.js';

const shouldRun: boolean = config.switches.imrWorldwide;

export { shouldRun, url, onLoad };
