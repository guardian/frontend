// @flow
import config from 'lib/config';
import { adblockInUse, getBreakpoint } from 'lib/detect';
import { local } from 'lib/storage';
import { isPayingMember } from 'common/modules/commercial/user-features';

const notMobile = (): boolean => getBreakpoint() !== 'mobile';

const visitedMoreThanOnce = (): boolean => {
    const alreadyVisited = local.get('gu.alreadyVisited') || 0;

    return alreadyVisited > 1;
};

const isAdblockSwitchOn = (): boolean => config.switches.adblock;

const showAdblockMsg = (): Promise<?boolean> =>
    isAdblockSwitchOn() &&
    !isPayingMember() &&
    visitedMoreThanOnce() &&
    notMobile()
        ? adblockInUse
        : Promise.resolve(false);

export { showAdblockMsg };
