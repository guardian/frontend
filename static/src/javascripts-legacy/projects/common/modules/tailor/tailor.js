define([
    'lib/fetch-json'
], function(
    fetchJson
) {
    function getEmail(browserId) {
        return fetchJson('https://tailor.guardianapis.com/email/' + browserId +'?emailIds=39,3322,3039,1950,38,3698', {
            method: 'get'
        });
    }

    function getSuggestions(browserId) {
        return fetchJson('https://tailor.guardianapis.com/suggestions?browserId=' + browserId, {
            method: 'get'
        });
    }

    function getRegularStatus(browserID) {
        return getSuggestions(browserID).then(function(res) {
            try {
                return res.userDataForClient.regular;
            } catch (e) {
                return false
            }
        })
    }

    function getSurvey(browserId, edition, forceShow) {
        var path = 'https://tailor.guardianapis.com/orangeSurvey?browserId=' + browserId + '&edition=' + edition;

        if (forceShow) {
            path += '&forceShow=true';
        }

        return fetchJson(path, {
            method: 'get'
        })
    }


    return {
        getEmail: getEmail,
        getSuggestions: getSuggestions,
        getRegularStatus: getRegularStatus,
        getSurvey: getSurvey
    };

});
