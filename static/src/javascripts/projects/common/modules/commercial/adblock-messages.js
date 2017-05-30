// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import { local } from 'lib/storage';
import userFeatures from 'commercial/modules/user-features';

const adblockInUse = () => detect.adblockInUse;

const notMobile = () => detect.getBreakpoint() !== 'mobile';

const isPayingMember = () => userFeatures.isPayingMember();

const visitedMoreThanOnce = () => {
    const alreadyVisited = local.get('gu.alreadyVisited') || 0;

    return alreadyVisited > 1;
};

const isAdblockSwitchOn = () => config.switches.adblock;

const noAdblockMsg = () => {
    if (notMobile()) {
        if (!visitedMoreThanOnce() || !isAdblockSwitchOn()) {
            return adblockInUse();
        }

        if (visitedMoreThanOnce() && isPayingMember()) {
            return adblockInUse();
        }
    }
    return Promise.resolve(false);
};

const showAdblockMsg = () =>
    isAdblockSwitchOn() &&
        !isPayingMember() &&
        visitedMoreThanOnce() &&
        notMobile()
        ? adblockInUse()
        : Promise.resolve(false);

export { noAdblockMsg, showAdblockMsg };
