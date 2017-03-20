define([
    'lib/fetch-json',
    'lib/cookies',
    'lib/storage',
    'lib/report-error'
], function(
    fetchJson,
    cookies,
    storage,
    reportError
) {

    var URLS = {
        email: 'https://tailor.guardianapis.com/email',
        suggestions: 'https://tailor.guardianapis.com/suggestions?browserId=',
        survey: 'https://tailor.guardianapis.com/orangeSurvey?browserId='
    };

    var browserId = cookies.get('bwid') || 'Qb6TGfeA6wRVyIkMkm7z9hMg'; // DELETE DUMMY 

    function getURL(type, queryParams) {
        var baseURL = URLS[type];

        if (!baseURL) {
            return '';
        }

        baseURL += browserId;

        if (queryParams) {
            var queryParamList = Object.keys(queryParams);

            baseURL += '?';

            queryParamList.forEach(function (queryParam, i) {
                baseURL += queryParam + '=' + queryParams[queryParam];

                if (i < (queryParamList.length - 1)) {
                    baseURL += '&';
                }
            });
        }

        return baseURL;
    }

    function fetchData(type, queryParams) {
        var tailorData = storage.local.get('gu.tailor.' + type);

        if (tailorData) {
            return Promise.resolve(tailorData);
        }

        if (!browserId) {
            return {};
        }

        var url = getURL(type, queryParams);

        if (!url) {
            return {};
        }

        fetchJson(url, {
            method: 'get'
        })
        .then(handleResponse.bind(null, type))
        .catch(handleError.bind(null, url))
    }

    function handleResponse(type, data) {
        var day = 1000 * 60 * 60 * 24;

        storage.local.set('gu.tailor.' + type, data, { expires: Date.now() + day });

        return Promise.resolve(data);
    }

    function handleError(url, error) {
        reportError(error, {
            feature: 'tailor',
            url: url
        });
    }

    // function getEmail(browserId) {
    //     return fetchJson('https://tailor.guardianapis.com/email/' + browserId +'?emailIds=39,3322,3039,1950,38,3698', {
    //         method: 'get'
    //     });
    // }

    // function getSuggestions(browserId) {
    //     return fetchJson('https://tailor.guardianapis.com/suggestions?browserId=' + browserId, {
    //         method: 'get'
    //     });
    // }

    // function getRegularStatus(browserID) {
    //     return getSuggestions(browserID).then(function(res) {
    //         try {
    //             return res.userDataForClient.regular;
    //         } catch (e) {
    //             return false
    //         }
    //     })
    // }

    // function getSurvey(browserId, edition, forceShow) {
    //     var path = 'https://tailor.guardianapis.com/orangeSurvey?browserId=' + browserId + '&edition=' + edition;

    //     if (forceShow) {
    //         path += '&forceShow=true';
    //     }

    //     return fetchJson(path, {
    //         method: 'get'
    //     })
    // }


    return {
        fetchData: fetchData
    };

});
