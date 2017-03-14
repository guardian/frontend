// @flow
import config from 'lib/config';
import fetch from 'lib/fetch';

function json(input: string, init: any = {}) {
    const options = Object.assign({}, init);
    let path = input;

    if (!input.match('^(https?:)?//')) {
        path = (config.page.ajaxUrl || '') + path;
        options.mode = 'cors';
    }

    return fetch(path, options).then(resp => {
        if (resp.ok) {
            return resp.json();
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
}

export default json;
