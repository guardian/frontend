define(['modules/storage', 'modules/id', 'modules/time' ], function(storage, id, time) {
    var userSegmentsKey = "gu.ads.userSegmentsData";

    function getUserSegments() {
        if(storage.isAvailable()) {
            var userSegmentsData = storage.get(userSegmentsKey);
            var userCookieData = id.getUserFromCookie();

            if(userSegmentsData) {
                if( userCookieData && ( userSegmentsData.userHash === ( userCookieData.id % 9999 ) ) ) {
                    return userSegmentsData.segments;
                } else {
                    storage.remove(userSegmentsKey);
                }
            }
        }

        return [];
    }

    function requestUserSegmentsFromId() {
        if(storage.isAvailable() && (storage.get(userSegmentsKey) === null)) {
            if(id.getUserFromCookie()) {
                id.getUserFromApi(
                    function(user) {
                        if(user.adData) {
                            var userSegments = [];
                            for(var key in user.adData) {
                                userSegments.push(key + user.adData[key]);
                            }
                            storage.set(
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