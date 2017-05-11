// @flow
import config from 'lib/config';
import mediator from 'lib/mediator';
import fetchJson from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';
import HostedCarousel from 'commercial/modules/hosted/onward-journey-carousel';

const loadOnwardComponent = (start: () => void, stop: () => void) => {
    start();

    const placeholders = document.getElementsByClassName(
        'js-onward-placeholder'
    );

    if (placeholders.length) {
        fetchJson(
            `${config.page.ajaxUrl}/${config.page.pageId}/${config.page.contentType.toLowerCase()}/` +
                `onward.json`,
            {
                mode: 'cors',
            }
        )
            .then(json =>
                fastdom.write(() => {
                    let i;
                    for (i = 0; i < placeholders.length; i += 1) {
                        placeholders[i].insertAdjacentHTML(
                            'beforeend',
                            json.html
                        );
                    }
                })
            )
            .then(() => {
                HostedCarousel.init();
                mediator.emit('hosted:onward:done');
            })
            .then(stop);
    } else {
        stop();
    }

    return Promise.resolve();
};

export default {
    init: loadOnwardComponent,
    whenRendered: new Promise(resolve => {
        mediator.on('hosted:onward:done', resolve);
    }),
};
