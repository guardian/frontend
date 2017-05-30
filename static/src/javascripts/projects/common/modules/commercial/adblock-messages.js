import config from 'lib/config';
import detect from 'lib/detect';
import storage from 'lib/storage';
import userFeatures from 'commercial/modules/user-features';

function adblockInUse() {
    return detect.adblockInUse;
}

function notMobile() {
    return detect.getBreakpoint() !== 'mobile';
}

function isPayingMember() {
    return userFeatures.isPayingMember();
}

function visitedMoreThanOnce() {
    var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;

    return alreadyVisited > 1;
}

function isAdblockSwitchOn() {
    return config.switches.adblock;
}

function noAdblockMsg() {
    if (notMobile()) {
        if (!visitedMoreThanOnce() || !isAdblockSwitchOn()) {
            return adblockInUse();
        }

        if (visitedMoreThanOnce() && isPayingMember()) {
            return adblockInUse();
        }
    }
    Promise.resolve(false);
}

function showAdblockMsg() {
    return isAdblockSwitchOn() && !isPayingMember() && visitedMoreThanOnce() && notMobile() ?
        adblockInUse() :
        Promise.resolve(false);
}

export default {
    noAdblockMsg: noAdblockMsg,
    showAdblockMsg: showAdblockMsg
};
