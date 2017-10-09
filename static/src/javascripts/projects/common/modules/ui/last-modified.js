// @flow

import fastdom from 'lib/fastdom-promise';

const lastModified = (): void => {
    fastdom
        .read(() => document.getElementsByClassName('js-lm')[0])
        .then(jsLm => {
            if (jsLm) {
                fastdom.write(() => {
                    jsLm.classList.add('content__dateline-wpd--modified');
                });

                jsLm.addEventListener('click', () => {
                    fastdom.write(() => {
                        jsLm.classList.toggle('u-h');
                    });
                });
            }
        });
};

export { lastModified };
