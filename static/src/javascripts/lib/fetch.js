// @flow
import reqwest from 'reqwest';

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

type CustomFetchRequest = {
    url: string,
    type: string,
    method: string,
    crossOrigin: boolean,
    headers: ?Object,
    data: string,
    withCredentials: boolean,
};

type CustomFetchResponse = {
    status: number,
    ok: boolean,
    statusText: string,
    url: string,
    text: () => Promise<string>,
    json: () => Promise<Object>,
};

const buildRequest = (path: string, options: Object): CustomFetchRequest => {
    const isCors = options.mode === 'cors';
    const withCredentials =
        (isCors && options.credentials === 'include') ||
        (!isCors && options.credentials === 'same-origin');

    return {
        url: path,
        type: 'text',
        method: options.method || 'GET',
        crossOrigin: isCors,
        headers: options.headers,
        data: options.body,
        withCredentials,
    };
};

const createResponse = (response: Object): CustomFetchResponse => {
    let bodyRead = false;
    const body = response.responseText;

    const text = () => {
        const result = bodyRead
            ? Promise.reject(new TypeError('Already read'))
            : Promise.resolve(body);
        bodyRead = true;
        return result;
    };

    return {
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        statusText: response.statusText,
        url: response.responseURL || '',
        text,
        json() {
            return text().then(JSON.parse);
        },
    };
};

const fetch = (input: string, init: ?Object): Promise<CustomFetchResponse> =>
    new Promise((resolve, reject) => {
        const req = buildRequest(input, init || {});
        reqwest(req)
            .then(resp => {
                resolve(createResponse(resp));
            })
            .catch(resp => {
                if (resp.status === 0) {
                    // reqwest wasn't able to make the request
                    reject(new Error(`Fetch error: ${resp.statusText}`));
                } else {
                    // an error response was received, in fetch this is not a rejection
                    resolve(createResponse(resp));
                }
            });
    });

export default fetch;
