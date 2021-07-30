import { storage } from '@guardian/libs';
import { getUserFromCookie, getUserFromApi } from '../identity/api';

/*
 * Inside the bundle:
 * - static/src/javascripts/projects/common/modules/commercial/build-page-targeting.js
 * - static/src/javascripts/projects/common/modules/commercial/build-page-targeting.spec.js
 * - static/src/javascripts/projects/common/modules/commercial/user-ad-targeting.spec.js
 *
 * Where is this file used outside the commercial bundle?
 * - static/src/javascripts/bootstraps/enhanced/common.js
 *
 */



const userSegmentsKey = 'gu.ads.userSegmentsData';

const getUserSegments = (adConsentState) => {
    if (storage.local.isAvailable() && adConsentState !== false) {
        const userSegmentsData = storage.local.get(userSegmentsKey);

        if (userSegmentsData) {
            const userCookieData = getUserFromCookie();

            if (
                userCookieData &&
                userSegmentsData.userHash === userCookieData.id % 9999
            ) {
                return userSegmentsData.segments;
            }
            storage.local.remove(userSegmentsKey);
        }
    }

    return [];
};

const requestUserSegmentsFromId = () => {
    if (
        storage.local.isAvailable() &&
        storage.local.get(userSegmentsKey) === null &&
        getUserFromCookie()
    ) {
        getUserFromApi(user => {
            if (user && user.adData) {
                const userSegments = [];
                Object.keys(user.adData).forEach(key => {
                    userSegments.push(key + user.adData[key]);
                });
                storage.local.set(
                    userSegmentsKey,
                    {
                        segments: userSegments,
                        userHash: user.id % 9999,
                    },
                    new Date().getTime() + 24 * 60 * 60 * 1000
                );
            }
        });
    }
};

export { getUserSegments, requestUserSegmentsFromId };
