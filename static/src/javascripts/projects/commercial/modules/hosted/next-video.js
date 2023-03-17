/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import config from '../../../../lib/config';
import { fetchJson } from '../../../../lib/fetch-json';
import fastdom from '../../../../lib/fastdom-promise';

const loadNextVideo = () => {
	const placeholders = document.querySelectorAll('.js-autoplay-placeholder');

	if (placeholders.length) {
		return fetchJson(
			`${config.get('page.ajaxUrl')}/${config.get(
				'page.pageId',
			)}/autoplay.json`,
			{
				mode: 'cors',
			},
		).then((json) =>
			fastdom.mutate(() => {
				let i;
				for (i = 0; i < placeholders.length; i += 1) {
					placeholders[i].innerHTML = json.html;
				}
			}),
		);
	}

	return Promise.resolve();
};

export { loadNextVideo as init, loadNextVideo as load };
