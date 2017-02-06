define([
    'reqwest',
    'Promise'
], function (
    reqwest,
    Promise
) {
    /**
     * Provide a minimal function equivalent to fetch. I don't dare calling it a
     * polyfill but the signature is the same, albeit simplified.
     *
     * fetch (input, init): Promise
     *
     * Differences with the standard fetch are
     *
     * - fetch
     * - - input can only be a string, Request is not supported
     * - - does not support JSONP
     * - - headers can only be specified as an object literal, the Headers interface is not supported
     * - Response
     * - - blob is not supported
     * - - formData is not supported
     * - - headers are not populated
     *
     * If you're still wondering what it actually supports
     * - CORS
     * - credentials
     * - body, any body that you want to add to your request except for GET or HEAD
     * - response.text() and response.json()
     * - response.ok .status .statusText
     */
    function fetch (input, init) {
        return new Promise(function(resolve, reject) {
            var req = buildRequest(input, init || {});
            reqwest(req)
            .then(function (resp) {
                resolve(createResponse(resp));
            })
            .fail(function (resp) {
                if (resp.status === 0) {
                    // reqwest wasn't able to make the request
                    reject(new Error('Fetch error: ' + resp.statusText));
                } else {
                    // an error response was received, in fetch this is not a rejection
                    resolve(createResponse(resp));
                }
            });
        });
    }

    function buildRequest (path, options) {
        var isCors = options.mode === 'cors';
        var withCredentials =
            (isCors && options.credentials === 'include') ||
            (!isCors && options.credentials === 'same-origin');

        return {
            url: path,
            type: 'text',
            method: options.method || 'GET',
            crossOrigin: isCors,
            headers: options.headers,
            data: options.body,
            withCredentials: withCredentials
        };
    }

    function createResponse (response) {
        var bodyRead = false;
        var body = response.responseText;

        function text () {
            var result = bodyRead ? Promise.reject(new TypeError('Already read')) : Promise.resolve(body);
            bodyRead = true;
            return result;
        }

        return {
            status: response.status,
            ok: response.status >= 200 && response.status < 300,
            statusText: response.statusText,
            url: response.responseURL || '',
            text: text,
            json: function () {
                return text().then(JSON.parse);
            }
        };
    }

    return fetch;
});
