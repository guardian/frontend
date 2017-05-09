import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';

export default {
    init: loadNextVideo,
    load: loadNextVideo
};

function loadNextVideo() {

    const placeholders = document.querySelectorAll('.js-autoplay-placeholder');

    if (placeholders.length) {
        return fetchJson(config.page.ajaxUrl + '/' + config.page.pageId + '/' + 'autoplay.json', {
                mode: 'cors'
            })
            .then(json => fastdom.write(() => {
            let i;
            for (i = 0; i < placeholders.length; i++) {
                placeholders[i].innerHTML = json.html;
            }
        }));
    }
    return Promise.resolve();
}
