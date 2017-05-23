// @flow
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';
import { initHostedCarousel } from './onward-journey-carousel';

// there should only ever be one onward component on the page
// if the component does not exist, return an empty array rather than `undefined`
const getPlaceholderFromDom = (
    dom: typeof document = document
): Array<HTMLElement> =>
    [...dom.getElementsByClassName('js-onward-placeholder')].slice(0, 1);

const generateUrlFromConfig = (
    c: {
        page: {
            ajaxUrl: string,
            pageId: string,
            contentType: string,
        },
    } = config
): string =>
    c.page.ajaxUrl && c.page.pageId && c.page.contentType
        ? `${c.page.ajaxUrl}/${c.page.pageId}/${c.page.contentType.toLowerCase()}/onward.json`
        : '';

const insertHTMLfromPlaceholders = (
    json: { html: string },
    placeholders: Array<HTMLElement>
): void => {
    placeholders[0].insertAdjacentHTML('beforeend', json.html);
};

export const loadOnwardComponent = (
    start: () => void,
    stop: () => void,
    insertHtmlFn: (
        json: { html: string },
        placeholders: Array<HTMLElement>
    ) => void = insertHTMLfromPlaceholders
): Promise<any> => {
    start();

    const placeholders: Array<HTMLElement> = getPlaceholderFromDom();
    const jsonUrl: string = generateUrlFromConfig();

    if (placeholders && placeholders.length) {
        fetchJson(jsonUrl, { mode: 'cors' })
            .then(json =>
                fastdom.write(() => {
                    insertHtmlFn(json, placeholders);
                })
            )
            .then(() => {
                initHostedCarousel();
            })
            .then(stop);
    } else {
        stop();
    }
    return Promise.resolve();
};

export const _ = { insertHTMLfromPlaceholders, generateUrlFromConfig };
