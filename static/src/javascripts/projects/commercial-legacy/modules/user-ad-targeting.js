// @flow
import { local } from 'lib/storage';
import { getUserFromCookie, getUserFromApi } from 'common/modules/identity/api';

const userSegmentsKey = 'gu.ads.userSegmentsData';

const getUserSegments = function(): Array<any> {
    if (local.isAvailable()) {
        let userCookieData;
        const userSegmentsData = local.get(userSegmentsKey);

        if (userSegmentsData) {
            userCookieData = getUserFromCookie();

            if (
                userCookieData &&
                userSegmentsData.userHash === userCookieData.id % 9999
            ) {
                return userSegmentsData.segments;
            }
            local.remove(userSegmentsKey);
        }
    }

    return [];
};

const requestUserSegmentsFromId = function(): void {
    if (
        local.isAvailable() &&
        local.get(userSegmentsKey) === null &&
        getUserFromCookie()
    ) {
        getUserFromApi(user => {
            if (user && user.adData) {
                const userSegments = [];
                Object.keys(user.adData).forEach(key => {
                    userSegments.push(key + user.adData[key]);
                });
                local.set(
                    userSegmentsKey,
                    {
                        segments: userSegments,
                        userHash: user.id % 9999,
                    },
                    {
                        expires: new Date().getTime() + 24 * 60 * 60 * 1000,
                    }
                );
            }
        });
    }
};

export { getUserSegments, requestUserSegmentsFromId };
