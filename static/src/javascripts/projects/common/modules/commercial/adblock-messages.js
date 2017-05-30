// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import { local } from 'lib/storage';
import userFeatures from 'commercial/modules/user-features';

const adblockInUse = function() {
    return detect.adblockInUse;
};

const notMobile = function() {
    return detect.getBreakpoint() !== 'mobile';
};

const isPayingMember = function() {
    return userFeatures.isPayingMember();
};

const visitedMoreThanOnce = function() {
    const alreadyVisited = local.get('gu.alreadyVisited') || 0;

    return alreadyVisited > 1;
};

const isAdblockSwitchOn = function() {
    return config.switches.adblock;
};

const noAdblockMsg = function() {
    if (notMobile()) {
        if (!visitedMoreThanOnce() || !isAdblockSwitchOn()) {
            return adblockInUse();
        }

        if (visitedMoreThanOnce() && isPayingMember()) {
            return adblockInUse();
        }
    }
    Promise.resolve(false);
};

const showAdblockMsg = function() {
    return isAdblockSwitchOn() &&
        !isPayingMember() &&
        visitedMoreThanOnce() &&
        notMobile()
        ? adblockInUse()
        : Promise.resolve(false);
};

export default {
    noAdblockMsg,
    showAdblockMsg,
};
