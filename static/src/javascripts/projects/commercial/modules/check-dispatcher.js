// @flow
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { checks } from 'common/modules/check-mediator-checks';
import { resolveCheck, waitForCheck } from 'common/modules/check-mediator';
import { getEpicTestToRun } from 'common/modules/experiments/ab';

/**
    Any check added to checksToDispatch should also
    be added to the array of checks in './check-mediator-checks'.
* */
const checksToDispatch = {
    isUserInContributionsAbTest(): Promise<boolean> {
        return getEpicTestToRun().then(Boolean);
    },

    isUserNotInContributionsAbTest(): Promise<boolean> {
        return waitForCheck('isUserInContributionsAbTest').then(
            userInContributionsAbTest => !userInContributionsAbTest
        );
    },

    hasHighPriorityAdLoaded(): Promise<boolean> {
        // if thirdPartyTags false no external ads are loaded
        // is irrelevant for ad-free users (independently of thirdPartyTags)
        if (
            commercialFeatures.thirdPartyTags &&
            commercialFeatures.highMerch &&
            !commercialFeatures.adFree
        ) {
            return Promise.resolve(trackAdRender('dfp-ad--merchandising-high'));
        }
        return Promise.resolve(false);
    },

    hasLowPriorityAdLoaded(): Promise<boolean> {
        // if thirdPartyTags false no external ads are loaded
        // is irrelevant for ad-free users (independently of thirdPartyTags)
        if (commercialFeatures.thirdPartyTags && !commercialFeatures.adFree) {
            return waitForCheck('hasHighPriorityAdLoaded').then(
                highPriorityAdLoaded => {
                    if (highPriorityAdLoaded) {
                        return Promise.resolve(
                            trackAdRender('dfp-ad--merchandising')
                        );
                    }
                    return Promise.resolve(true);
                }
            );
        }
        return Promise.resolve(false);
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
