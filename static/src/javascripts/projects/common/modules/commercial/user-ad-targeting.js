// @flow
import { local } from 'lib/storage';
import { getUserFromCookie } from 'common/modules/identity/api';

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

export { getUserSegments };
