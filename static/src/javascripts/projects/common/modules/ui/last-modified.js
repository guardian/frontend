// @flow

import fastdom from 'lib/fastdom-promise';

const lastModified = (): void => {
    fastdom
        .read(() => ({
            lastModifiedElm: document.getElementsByClassName('js-lm')[0],
            webPublicationDateElm: document.getElementsByClassName('js-wpd')[0],
        }))
        .then(els => {
            const { lastModifiedElm, webPublicationDateElm } = els;

            if (lastModifiedElm) {
                fastdom.write(() => {
                    webPublicationDateElm.classList.add(
                        'content__dateline-wpd--modified'
                    );
                });

                webPublicationDateElm.addEventListener('click', () => {
                    fastdom.write(() => {
                        lastModifiedElm.classList.toggle('u-h');
                    });
                });
            }
        });
};

export { lastModified };
