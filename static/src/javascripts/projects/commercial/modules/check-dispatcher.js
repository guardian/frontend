// @flow
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { checks } from 'common/modules/check-mediator-checks';
import { resolveCheck, waitForCheck } from 'common/modules/check-mediator';
import { getEpicTestToRun } from 'common/modules/experiments/ab';

/**
    Any check added to checksToDispatch should also
    be added to the array of checks in './check-mediator-checks'.
* */
const checksToDispatch = {
    isOutbrainDisabled(): Promise<boolean> {
        if (commercialFeatures.outbrain) {
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    },

    isUserInContributionsAbTest(): Promise<boolean> {
        return getEpicTestToRun().then(Boolean);
    },

    isUserNotInContributionsAbTest(): Promise<boolean> {
        return waitForCheck('isUserInContributionsAbTest').then(
            userInContributionsAbTest => !userInContributionsAbTest
        );
    },

};

const initCheckDispatcher = (): void => {
    Object.keys(checksToDispatch).forEach(key => {
        if (checks.includes(key)) {
            resolveCheck(key, checksToDispatch[key]());
        }
    });
};

export { initCheckDispatcher };
