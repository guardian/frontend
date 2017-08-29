// @flow
import { Component } from 'common/modules/component';
import mediator from 'lib/mediator';
import { checkElemsForVideos } from 'common/modules/atoms/youtube';

const moreInSeriesContainerInit = (
    el: HTMLElement,
    mediaType: string,
    section: string,
    shortUrl: string,
    series?: string
): void => {
    const component = new Component();
    const seriesStr = series ? `/${series}` : '';
    // exclude professional network content from video pages
    const excludeProfContent =
        mediaType === 'video'
            ? '&exclude-tag=guardian-professional/guardian-professional'
            : '';

    const endpoint = `/${mediaType}/section/${section}${seriesStr}.json?shortUrl=${shortUrl}${excludeProfContent}`;

    component.endpoint = endpoint;

    component.fetch(el).then(() => {
        checkElemsForVideos([el]);
        mediator.emit('page:media:moreinloaded', el);
        mediator.emit('page:new-content', el);
    });
};

export { moreInSeriesContainerInit };
