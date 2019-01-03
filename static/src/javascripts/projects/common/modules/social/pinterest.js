// @flow

import fastdom from 'fastdom';
import { loadScript } from 'lib/load-script';

const launchOverlay = (event: Event): void => {
    event.preventDefault();

    const scriptUrl = 'https://assets.pinterest.com/js/pinmarklet.js';
    const cachePurge = new Date().getTime();
    const images = Array.from(
        document.querySelectorAll('img:not(.gu-image):not(.responsive-img)')
    );

    fastdom.write(() => {
        images.forEach(img => {
            img.setAttribute('data-pin-nopin', 'true');
        });
    });

    loadScript(`${scriptUrl}?r=${cachePurge}`);
};

const initPinterest = (): void => {
    const buttons = Array.from(
        document.querySelectorAll('.social__item--pinterest')
    );

    fastdom.write(() => {
        buttons.forEach(el => {
            el.addEventListener('click', launchOverlay);
        });
    });
};

export { initPinterest };
