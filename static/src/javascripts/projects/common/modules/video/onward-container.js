// @flow

import bean from 'bean';
import config from 'lib/config';
import { Component } from 'common/modules/component';

const getEndpoint = (mediaType: string): string => {
    const isInSeries = Boolean(config.page.seriesTags);

    if (isInSeries) {
        return `/video/in-series/${config.page.seriesId}.json`;
    }

    return `/${config.page.isPodcast ? 'podcast' : mediaType}/most-viewed.json`;
};

const createComponent = (
    el: HTMLElement,
    endpoint: string,
    manipulationType: string,
    page?: ?string
): Promise<void> => {
    const component = new Component();

    component.manipulationType = manipulationType;
    component.endpoint = endpoint + (page ? `?page=${page}` : '');
    el.innerHTML = ''; // we have no replace in component

    return component.fetch(el, 'html');
};

const initEvents = (
    el: HTMLElement,
    manipulationType: string,
    endpoint: string
): void => {
    bean.on(el, 'click', '.most-viewed-navigation__button', (ev: Event) => {
        const target: HTMLElement = (ev.target: any);
        const page = target.getAttribute('data-page');

        createComponent(el, endpoint, manipulationType, page);

        ev.preventDefault();
        return false;
    });
};

const onwardVideo = (el: HTMLElement, mediaType: string) => {
    const manipulationType = mediaType === 'video' ? 'append' : 'html';
    const endpoint = getEndpoint(mediaType);

    createComponent(el, endpoint, manipulationType).then(() => {
        initEvents(el, manipulationType, endpoint);
    });
};

export { onwardVideo };
