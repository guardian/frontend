import config from 'lib/config';
import { Component } from 'common/modules/component';

const createComponent = (
    el,
    endpoint,
    manipulationType
) => {
    const component = new Component();

    component.manipulationType = manipulationType;
    component.endpoint = `${endpoint}?shortUrl=${config.get('page.shortUrl')}`;
    el.innerHTML = '';

    return component.fetch(el, 'html');
};

const onwardAudio = (el) => {
    if (config.get('page.seriesId')) {
        const manipulationType = 'append';
        const endpoint = `/audio/series/${config.get('page.seriesId')}.json`;

        createComponent(el, endpoint, manipulationType);
    }
};

export { onwardAudio };
