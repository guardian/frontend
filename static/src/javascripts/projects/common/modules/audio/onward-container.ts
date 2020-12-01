import { Component } from 'common/modules/component';
import config from 'lib/config';

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
