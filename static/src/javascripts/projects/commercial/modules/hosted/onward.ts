import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import fetchJson from 'lib/fetch-json';
import { initHostedCarousel } from './onward-journey-carousel';

// there should only ever be one onward component on the page
// if the component does not exist, return an empty array rather than `undefined`
const getPlaceholderFromDom = (
    dom: typeof document = document
): HTMLElement[] =>
    Array.from(dom.getElementsByClassName('js-onward-placeholder')).slice(0, 1);

const generateUrlFromConfig = (
    c: {
        page: {
            ajaxUrl: string;
            pageId: string;
            contentType: string;
        };
    } = config
): string =>
    c.page.pageId && c.page.contentType
        ? `${c.page.ajaxUrl || ''}/${
              c.page.pageId
          }/${c.page.contentType.toLowerCase()}/onward.json`
        : '';

const insertHTMLfromPlaceholders = (
    json: { html: string },
    placeholders: HTMLElement[]
): void => {
    placeholders[0].insertAdjacentHTML('beforeend', json.html);
};

export const loadOnwardComponent = (
    insertHtmlFn: (
        json: { html: string },
        placeholders: HTMLElement[]
    ) => void = insertHTMLfromPlaceholders
): Promise<any> => {
    const placeholders: HTMLElement[] = getPlaceholderFromDom();
    const jsonUrl: string = generateUrlFromConfig();

    if (placeholders && placeholders.length) {
        fetchJson(jsonUrl, { mode: 'cors' })
            .then((json) =>
                fastdom.mutate(() => {
                    insertHtmlFn(json, placeholders);
                })
            )
            .then(() => {
                initHostedCarousel();
            });
    }

    return Promise.resolve();
};

export const _ = { insertHTMLfromPlaceholders, generateUrlFromConfig };
