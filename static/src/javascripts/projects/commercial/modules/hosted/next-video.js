// @flow
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';

const loadNextVideo = (): Promise<void> => {
    const placeholders = document.querySelectorAll('.js-autoplay-placeholder');

    if (placeholders.length) {
        return fetchJson(
            `${config.page.ajaxUrl}/${config.page.pageId}/autoplay.json`,
            {
                mode: 'cors',
            }
        ).then(json =>
            fastdom.write(() => {
                let i;
                for (i = 0; i < placeholders.length; i += 1) {
                    placeholders[i].innerHTML = json.html;
                }
            })
        );
    }

    return Promise.resolve();
};

export default {
    init: loadNextVideo,
    load: loadNextVideo,
};
