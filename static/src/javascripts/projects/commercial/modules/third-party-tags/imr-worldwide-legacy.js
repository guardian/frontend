// @flow
import config from 'lib/config';
import { isInAuOrNz } from 'common/modules/commercial/geo-utils';
// $FlowFixMe -- temporarily until new release in commercial-core is made
import type { ThirdPartyTag } from '@guardian/commercial-core';

// nol_t is a global function defined by the IMR worldwide library
// eslint-disable-next-line camelcase
declare var nol_t: (config: any) => any;

const onLoad = () => {
    const pvar = {
        cid: 'au-guardian',
        content: '0',
        server: 'secure-gl',
    };

    const trac = nol_t(pvar);
    trac.record().post();
};

export const imrWorldwideLegacy: ThirdPartyTag = {
    shouldRun: config.get('switches.imrWorldwide') && isInAuOrNz(),
    url: '//secure-au.imrworldwide.com/v60.js',
    onLoad,
};
