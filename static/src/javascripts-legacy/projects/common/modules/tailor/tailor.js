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
        getSurvey: getSurvey
    };
});
