/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/projects/common/modules/audio/onward-container.js
 * to .ts, then delete it.
 */

// @flow

import config from 'lib/config';
import { Component } from 'common/modules/component';

const createComponent = (
    el: HTMLElement,
    endpoint: string,
    manipulationType: string
): Promise<void> => {
    const component = new Component();

    component.manipulationType = manipulationType;
    component.endpoint = `${endpoint}?shortUrl=${config.get('page.shortUrl')}`;
    el.innerHTML = '';

    return component.fetch(el, 'html');
};

const onwardAudio = (el: HTMLElement) => {
    if (config.get('page.seriesId')) {
        const manipulationType = 'append';
        const endpoint = `/audio/series/${config.get('page.seriesId')}.json`;

        createComponent(el, endpoint, manipulationType);
    }
};

export { onwardAudio };
