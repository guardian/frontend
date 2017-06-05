// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import { local } from 'lib/storage';
import { isPayingMember } from 'projects/commercial/modules/user-features';

const adblockInUse = (): Promise<boolean> => detect.adblockInUse;

const notMobile = (): boolean => detect.getBreakpoint() !== 'mobile';

const visitedMoreThanOnce = (): boolean => {
    const alreadyVisited = local.get('gu.alreadyVisited') || 0;

    return alreadyVisited > 1;
};

const isAdblockSwitchOn = (): boolean => config.switches.adblock;

const showAdblockMsg = (): Promise<boolean> =>
    isAdblockSwitchOn() &&
        !isPayingMember() &&
        visitedMoreThanOnce() &&
        notMobile()
        ? adblockInUse()
        : Promise.resolve(false);

export { showAdblockMsg };
