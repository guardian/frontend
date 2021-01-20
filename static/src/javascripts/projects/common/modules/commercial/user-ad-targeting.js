import { storage } from '@guardian/libs';
import { getUserFromCookie, getUserFromApi } from 'common/modules/identity/api';

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
