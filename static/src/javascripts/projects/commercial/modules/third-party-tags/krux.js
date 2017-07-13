// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { local } from 'lib/storage';

const retrieve = (n: string): string => {
    const k: string = `kx${n}`;

    return local.getRaw(k) || getCookie(`${k}=([^;]*)`) || '';
};

export const getKruxSegments = (): Array<string> =>
    retrieve('segs') ? retrieve('segs').split(',') : [];

export const krux: ThirdPartyTag = {
    shouldRun: config.switches.krux,
    url: '//cdn.krxd.net/controltag?confid=JVZiE3vn',
};
