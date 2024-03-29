/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/projects/commercial/modules/hosted/next-video.js
 * to .ts, then delete it.
 */

// @flow
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';

const loadNextVideo = (): Promise<void> => {
    const placeholders = document.querySelectorAll('.js-autoplay-placeholder');

    if (placeholders.length) {
        return fetchJson(
            `${config.get('page.ajaxUrl')}/${config.get(
                'page.pageId'
            )}/autoplay.json`,
            {
                mode: 'cors',
            }
        ).then(json =>
            fastdom.mutate(() => {
                let i;
                for (i = 0; i < placeholders.length; i += 1) {
                    placeholders[i].innerHTML = json.html;
                }
            })
        );
    }

    return Promise.resolve();
};

export { loadNextVideo as init, loadNextVideo as load };
