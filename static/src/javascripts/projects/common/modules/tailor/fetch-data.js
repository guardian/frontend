// @flow

import fetchJson from 'lib/fetch-json';
import { getCookie } from 'lib/cookies';
import { local as localStorage } from 'lib/storage';
import reportError from 'lib/report-error';
import config from 'lib/config';

const BROWSER_ID = getCookie('bwid');
const URLS = {
    suggestions: 'https://tailor.guardianapis.com/suggestions?browserId=',
};

const getURL = (type: string, queryParams?: Object): ?string => {
    if (!BROWSER_ID || !URLS[type]) {
        return;
    }

    let baseURL = URLS[type] + BROWSER_ID;

    if (queryParams) {
        Object.keys(queryParams).forEach(key => {
            if (queryParams) {
                const value = queryParams[key];
                baseURL += `&${key}=${value}`;
            }
        });
    }

    return baseURL;
};

const handleResponse = (url: string, data: Object): Promise<Object> => {
    const tailorData = localStorage.get('gu.tailor') || {};
    const hour = 1000 * 60 * 60;

    tailorData[url] = data;

    localStorage.set('gu.tailor', tailorData, { expires: Date.now() + hour });

    return Promise.resolve(data);
};

const handleError = (url: string, error: Error): void => {
    reportError(error, {
        feature: 'tailor',
        url,
    });
};

const fetchData = (
    type: string,
    bypassStorage: boolean,
    queryParams?: Object
): Promise<Object> => {
    const url = getURL(type, queryParams);

    // exit if no valid url end point, or tailor switch is off
    if (!url || !config.switches.useTailorEndpoints) {
        return Promise.resolve({});
    }

    const tailorData = bypassStorage ? null : localStorage.get('gu.tailor');

    // if data in local storage, resolve with this
    if (tailorData && tailorData[url]) {
        return Promise.resolve(tailorData[url]);
    }

    return fetchJson(url).then(data => handleResponse(url, data)).catch(err => {
        handleError(url, err);
        return Promise.resolve({});
    });
};

export { fetchData };
