// @flow
import config from 'lib/config';
import fetch from 'lib/fetch';

const json = (
    input: string | Request,
    init: RequestOptions = {}
): Promise<any> => {
    // #? we should use Object.assign for this assignment, but this currently breaks
    // Karma tests that depend on fetch-json.js and have not been stubbed
    const options = init;
    let path = typeof input === 'string' ? input : input.url;

    if (!path.match('^(https?:)?//')) {
        path = config.get('page.ajaxUrl', '') + path;
        options.mode = 'cors';
    }

    return fetch(path, options).then(resp => {
        if (resp.ok) {
            switch (resp.status) {
                case 204:
                    return {};
                default:
                    return resp.json();
            }
        }
        if (!resp.status) {
            // IE9 uses XDomainRequest which doesn't set the response status thus failing
            // even when the response was actually valid
            return resp.text().then(responseText => {
                try {
                    return JSON.parse(responseText);
                } catch (ex) {
                    throw new Error(
                        `Fetch error while requesting ${path}: Invalid JSON response`
                    );
                }
            });
        }
        throw new Error(
            `Fetch error while requesting ${path}: ${resp.statusText}`
        );
    });
};

export default json;
