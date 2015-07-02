define([
    'common/utils/storage',
    'common/utils/time',
    'common/modules/identity/api'
], function (
    storage,
    time,
    id
) {
    var userSegmentsKey = 'gu.ads.userSegmentsData';

    function getUserSegments() {
        if (storage.local.isAvailable()) {
            var userCookieData,
                userSegmentsData = storage.local.get(userSegmentsKey);

            if (userSegmentsData) {
                userCookieData = id.getUserFromCookie();

                if (userCookieData && (userSegmentsData.userHash === (userCookieData.id % 9999))) {
                    return userSegmentsData.segments;
                } else {
                    storage.local.remove(userSegmentsKey);
                }
            }
        }

        return [];
    }

    function requestUserSegmentsFromId() {
        if (storage.local.isAvailable() && (storage.local.get(userSegmentsKey) === null) && id.getUserFromCookie()) {
            id.getUserFromApi(function (user) {
                if (user && user.adData) {
                    var key,
                        userSegments = [];
                    for (key in user.adData) {
                        userSegments.push(key + user.adData[key]);
                    }
                    storage.local.set(
                        userSegmentsKey,
                        {
                            segments: userSegments,
                            userHash: user.id % 9999
                        },
                        {
                            expires: time.currentDate().getTime() + (24 * 60 * 60 * 1000)
                        }
                    );
                }
            });
        }
    }

    return {
        getUserSegments: getUserSegments,
        requestUserSegmentsFromId: requestUserSegmentsFromId
    };
});
