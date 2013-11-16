define(['utils/storage', 'modules/identity/api', 'utils/time' ], function(storage, id, time) {
    var userSegmentsKey = "gu.ads.userSegmentsData";

    function getUserSegments() {
        if(storage.local.isAvailable()) {
            var userSegmentsData = storage.local.get(userSegmentsKey);
            var userCookieData = id.getUserFromCookie();

            if(userSegmentsData) {
                if( userCookieData && ( userSegmentsData.userHash === ( userCookieData.id % 9999 ) ) ) {
                    return userSegmentsData.segments;
                } else {
                    storage.local.remove(userSegmentsKey);
                }
            }
        }

        return [];
    }

    function requestUserSegmentsFromId() {
        if(storage.local.isAvailable() && (storage.local.get(userSegmentsKey) === null)) {
            if(id.getUserFromCookie()) {
                id.getUserFromApi(
                    function(user) {
                        if(user.adData) {
                            var userSegments = [];
                            for(var key in user.adData) {
                                userSegments.push(key + user.adData[key]);
                            }
                            storage.local.set(
                                userSegmentsKey,
                                {
                                    'segments' : userSegments,
                                    'userHash' : user.id % 9999
                                },
                                {
                                    expires : time.currentDate().getTime() + (24 * 60 * 60 * 1000 )
                                }
                            );
                        }
                    }
                );
            }
        }
    }

    return {
        'getUserSegments' : getUserSegments,
        'requestUserSegmentsFromId' : requestUserSegmentsFromId
    };
});
