define([
    'Promise',
    'lib/fetch-json',
    'lib/cookies',
    'lib/storage',
    'lib/report-error'
], function(
    Promise,
    fetchJson,
    cookies,
    storage,
    reportError
) {

    var URLS = {
        suggestions: 'https://tailor.guardianapis.com/suggestions?browserId='
    };

    var browserId = cookies.get('bwid');

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

    /**
     * type (required) is a string which should match a key in the URLS object
     * queryParams (optional) is an object literal, each key/value will be query string parameter
     * eg. {foo:'bar', hello:'world'} translates to ?foo=bar&hello=world
     *
    **/
    function fetchData(type, queryParams) {
        var tailorData = storage.local.get('gu.tailor.' + type);

        // if data in local storage return this
        if (tailorData) {
            return Promise.resolve(tailorData);
        }

        // if no browserId return empty object
        if (!browserId) {
            return Promise.resolve({});
        }

        var url = getURL(type, queryParams);

        // if type doesn't have a valid end point url return empty object
        if (!url) {
            return Promise.resolve({});
        }

        return fetchJson(url, {
                    method: 'get'
                })
                .then(handleResponse.bind(null, type))
                .catch(handleError.bind(null, type))
    }

    function handleResponse(type, data) {
        var hour = 1000 * 60 * 60;

        storage.local.set('gu.tailor.' + type, data, { expires: Date.now() + hour });

        return Promise.resolve(data);
    }

    function handleError(type, error) {
        reportError(error, {
            feature: 'tailor',
            type: type
        });
    }

    return {
        fetchData: fetchData
    };
});
