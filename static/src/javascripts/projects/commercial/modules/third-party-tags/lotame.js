// @flow
import config from 'lib/config';
import { isInAuOrNz, isInUsOrCa } from 'common/modules/commercial/geo-utils';

export const lotame: () => ThirdPartyTag = () => ({
    shouldRun:
        config.get('switches.lotame', false) && !(isInUsOrCa() || isInAuOrNz()),
    url: '//tags.crwdcntrl.net/c/12666/cc.js',
    sourcepointId: '5ed6aeb1b8e05c241a63c71f',
});
