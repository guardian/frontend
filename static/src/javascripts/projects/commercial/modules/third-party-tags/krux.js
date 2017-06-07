// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { local } from 'lib/storage';

const url: string = '//cdn.krxd.net/controltag?confid=JVZiE3vn';

const retrieve = (n: string): string => {
    const k: string = `kx${n}`;

    return local.getRaw(k) || getCookie(`${k}=([^;]*)`) || '';
};

const getKruxSegments = (): Array<string> =>
    retrieve('segs') ? retrieve('segs').split(',') : [];

const shouldRun = config.switches.krux;

export { shouldRun, url, getKruxSegments };
