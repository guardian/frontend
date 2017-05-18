// @flow
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';
import { initHostedCarousel } from './onward-journey-carousel';

const getPlaceholdersFromDom = (dom = document): Array<any> =>
    [].slice.call(dom.getElementsByClassName('js-onward-placeholder'));

const generateUrlFromConfig = (
    c: {
        page: {
            ajaxUrl: string,
            pageId: string,
            contentType: string,
        },
    } = config
): string => `${c.page.ajaxUrl}/${c.page.pageId}/${c.page.contentType.toLowerCase()}/onward.json`;

const insertHTMLfromPlaceholders = (
    json: { html: string },
    placeholders: Array<any>
): void => {
    placeholders[0].insertAdjacentHTML('beforeend', json.html);
};

export const loadOnwardComponent = (
    start: () => void,
    stop: () => void,
    getPlaceholders: () => Array<any> = getPlaceholdersFromDom,
    getUrl: () => string = generateUrlFromConfig,
    getJson: (url: string, options: RequestOptions) => Promise<any> = fetchJson,
    insertHtmlFn: (
        json: { html: string },
        placeholders: Array<any>
    ) => void = insertHTMLfromPlaceholders,
    initHostedComponent: () => Promise<any> = initHostedCarousel
): Promise<any> => {
    start();

    const placeholders = getPlaceholders();
    const url = getUrl();

    if (placeholders && placeholders.length) {
        getJson(url, { mode: 'cors' })
            .then(json =>
                fastdom.write(() => {
                    insertHtmlFn(json, placeholders);
                })
            )
            .then(() => {
                initHostedComponent();
            })
            .then(stop);
    } else {
        stop();
    }
    return Promise.resolve();
};

export const _ = { insertHTMLfromPlaceholders, generateUrlFromConfig };
