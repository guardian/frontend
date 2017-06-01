// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { local } from 'lib/storage';

const kruxUrl: string = '//cdn.krxd.net/controltag?confid=JVZiE3vn';

const retrieve = (n: string): string => {
    const k: string = `kx${n}`;

    return local.getRaw(k) || getCookie(`${k}=([^;]*)`) || '';
};

const getSegments = (): Array<string> =>
    retrieve('segs') ? retrieve('segs').split(',') : [];

export default {
    shouldRun: config.switches.krux,
    url: kruxUrl,
    getSegments,
};
