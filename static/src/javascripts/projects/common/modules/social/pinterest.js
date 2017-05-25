// @flow
import fastdom from 'fastdom';
import bean from 'bean';
import $ from 'lib/$';
import { loadScript } from 'lib/load-script';

const launchOverlay = (event: Event): void => {
    event.preventDefault();

    const scriptUrl = 'https://assets.pinterest.com/js/pinmarklet.js';
    const cachePurge = new Date().getTime();

    $('img:not(.gu-image):not(.responsive-img)').each(img => {
        fastdom.write(() => {
            $(img).attr('data-pin-nopin', 'true');
        });
    });

    loadScript(`${scriptUrl}?r=${cachePurge}`);
};

const initPinterest = (): void => {
    const buttons = $('.social__item--pinterest');

    buttons.each(el => {
        bean.on(el, 'click', launchOverlay);
    });
};

export { initPinterest };
