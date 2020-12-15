import bean from 'bean';
import config from 'lib/config';
import { Component } from 'common/modules/component';

const getEndpoint = (mediaType) => {
    const isInSeries = Boolean(config.get('page.seriesTags'));

    if (isInSeries) {
        return `/video/in-series/${config.get('page.seriesId')}.json`;
    }

    return `/${
        config.get('page.isPodcast') ? 'podcast' : mediaType
    }/most-viewed.json`;
};

const createComponent = (
    el,
    endpoint,
    manipulationType,
    page
) => {
    const component = new Component();

    component.manipulationType = manipulationType;
    component.endpoint = endpoint + (page ? `?page=${page}` : '');
    el.innerHTML = ''; // we have no replace in component

    return component.fetch(el, 'html');
};

const initEvents = (
    el,
    manipulationType,
    endpoint
) => {
    bean.on(el, 'click', '.most-viewed-navigation__button', (ev) => {
        const target = (ev.target);
        const page = target.getAttribute('data-page');

        createComponent(el, endpoint, manipulationType, page);

        ev.preventDefault();
        return false;
    });
};

const onwardVideo = (el, mediaType) => {
    const manipulationType = mediaType === 'video' ? 'append' : 'html';
    const endpoint = getEndpoint(mediaType);

    createComponent(el, endpoint, manipulationType).then(() => {
        initEvents(el, manipulationType, endpoint);
    });
};

export { onwardVideo };
