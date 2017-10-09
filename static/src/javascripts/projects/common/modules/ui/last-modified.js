// @flow

import fastdom from 'fastdom';

const lastModified = (): void => {
    const jsLm = document.getElementsByClassName('js-lm')[0];

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
};

export { lastModified };
