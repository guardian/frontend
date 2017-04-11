define([
    'lib/storage',
    'common/modules/identity/api'
], function (
    storage,
    id
) {
    var userSegmentsKey = 'gu.ads.userSegmentsData';

    function getUserSegments() {
        if (storage.localStorage.isAvailable()) {
            var userCookieData,
                userSegmentsData = storage.localStorage.get(userSegmentsKey);

            if (userSegmentsData) {
                userCookieData = id.getUserFromCookie();

                if (userCookieData && (userSegmentsData.userHash === (userCookieData.id % 9999))) {
                    return userSegmentsData.segments;
                } else {
                    storage.localStorage.remove(userSegmentsKey);
                }
            }
        }

        return [];
    }

    function requestUserSegmentsFromId() {
        if (storage.localStorage.isAvailable() && (storage.localStorage.get(userSegmentsKey) === null) && id.getUserFromCookie()) {
            id.getUserFromApi(function (user) {
                if (user && user.adData) {
                    var key,
                        userSegments = [];
                    for (key in user.adData) {
                        userSegments.push(key + user.adData[key]);
                    }
                    storage.localStorage.set(
                        userSegmentsKey,
                        {
                            segments: userSegments,
                            userHash: user.id % 9999
                        },
                        {
                            expires: new Date().getTime() + (24 * 60 * 60 * 1000)
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
