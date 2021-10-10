import config from '../../../../lib/config';
import { fetchJson } from '../../../../lib/fetch-json';
import fastdom from '../../../../lib/fastdom-promise';
import { initHostedCarousel } from './onward-journey-carousel';

// there should only ever be one onward component on the page
// if the component does not exist, return an empty array rather than `undefined`
const getPlaceholderFromDom = (dom = document) =>
	Array.from(dom.getElementsByClassName('js-onward-placeholder')).slice(0, 1);

const generateUrlFromConfig = (c = config) =>
	c.page.pageId && c.page.contentType
		? `${c.page.ajaxUrl || ''}/${
				c.page.pageId
		  }/${c.page.contentType.toLowerCase()}/onward.json`
		: '';

const insertHTMLfromPlaceholders = (json, placeholders) => {
	placeholders[0].insertAdjacentHTML('beforeend', json.html);
};

export const loadOnwardComponent = (
	insertHtmlFn = insertHTMLfromPlaceholders,
) => {
	const placeholders = getPlaceholderFromDom();
	const jsonUrl = generateUrlFromConfig();

	if (placeholders && placeholders.length) {
		fetchJson(jsonUrl, { mode: 'cors' })
			.then((json) =>
				fastdom.mutate(() => {
					insertHtmlFn(json, placeholders);
				}),
			)
			.then(() => {
				initHostedCarousel();
			});
	}

	return Promise.resolve();
};

export const _ = { insertHTMLfromPlaceholders, generateUrlFromConfig };
