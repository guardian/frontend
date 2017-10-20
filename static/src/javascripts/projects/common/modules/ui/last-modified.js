// @flow

import fastdom from 'lib/fastdom-promise';

const lastModified = (): void => {
    fastdom
        .read(() => ({
            jsLm: document.getElementsByClassName('js-lm')[0],
            jsWpd: document.getElementsByClassName('js-wpd')[0],
        }))
        .then(els => {
            const { jsLm, jsWpd } = els;

            if (jsLm) {
                fastdom.write(() => {
                    jsWpd.classList.add('content__dateline-wpd--modified');
                });

                jsWpd.addEventListener('click', () => {
                    fastdom.write(() => {
                        jsLm.classList.toggle('u-h');
                    });
                });
            }
        });
};

export { lastModified };
