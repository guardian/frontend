define([
    'Promise',
    'lib/fetch-json',
    'lib/cookies',
    'lib/storage',
    'lib/report-error',
    'lib/config'
], function(
    Promise,
    fetchJson,
    cookies,
    storage,
    reportError,
    config
) {

    var URLS = {
        suggestions: 'https://tailor.guardianapis.com/suggestions?browserId='
    };

    var browserId = cookies.get('bwid');

    function getURL(type, queryParams) {
        var baseURL = URLS[type];

        if (!browserId || !baseURL) {
            return '';
        }

        baseURL += browserId;

        if (queryParams) {
            Object.keys(queryParams).forEach(function (key) {
                baseURL += '&' + key + '=' + queryParams[key];
            });
        }

        return baseURL;
    }

    /**
     * type (required) is a string which should match a key in the URLS object
     * bypassStorage a boolean, if true don't retrieve data from local storage
     * queryParams an object literal, each key/value will be query string parameter
     * eg. {foo:'bar', hello:'world'} translates to ?foo=bar&hello=world
     *
    **/
    function fetchData(type, bypassStorage, queryParams) {
        var url = getURL(type, queryParams);

        // if no valid url end point return empty object
        if (!url) {
            return Promise.resolve({});
        }

        var tailorData = bypassStorage ? null : storage.local.get('gu.tailor');

        // if data in local storage return this
        if (tailorData && tailorData[url]) {
            return Promise.resolve(tailorData[url]);
        }

        // if use tailor switch is off then return an empty object
        if (!config.switches.useTailorEndpoints) {
            return Promise.resolve({});
        }

        return fetchJson(url, {
                    method: 'get'
                })
                .then(handleResponse.bind(null, url))
                .catch(handleError.bind(null, url))
    }

    function handleResponse(url, data) {
        var tailorData = storage.local.get('gu.tailor') || {};
        var hour = 1000 * 60 * 60;

        tailorData[url] = data;

        storage.local.set('gu.tailor', tailorData, {expires: Date.now() + hour});
    }

    function handleError(url, error) {
        reportError(error, {
            feature: 'tailor',
            url: url
        });
    }

    return {
        fetchData: fetchData
    };
});
