// @flow

import $ from 'lib/$';
import config from 'lib/config';
import { videoContainerInit } from 'common/modules/video/video-container';
import { onwardVideo } from 'common/modules/video/onward-container';
import { moreInSeriesContainerInit } from 'common/modules/video/more-in-series-container';

const getMediaType = (): string =>
    config.get('page.contentType', '').toLowerCase();

const initMoreInSection = (): void => {
    const {
        showRelatedContent,
        isPaidContent,
        section,
        shortUrl,
        seriesId,
    } = config.get('page', {});

    if (
        !config.get('isMedia') ||
        !showRelatedContent ||
        isPaidContent ||
        !section
    ) {
        return;
    }

    const el = $('.js-more-in-section')[0];
    moreInSeriesContainerInit(el, getMediaType(), section, shortUrl, seriesId);
};

const initOnwardContainer = (): void => {
    if (!config.get('isMedia')) {
        return;
    }

    const mediaType = getMediaType();
    const els = $(
        mediaType === 'video'
            ? '.js-video-components-container'
            : '.js-media-popular'
    );

    els.each(el => {
        onwardVideo(el, mediaType);
    });
};

const initFacia = (): void => {
    if (config.get('page.isFront')) {
        $('.js-video-playlist').each(el => {
            videoContainerInit(el);
        });
    }
};

export const init = (): void => {
    initFacia();
    initMoreInSection();
    initOnwardContainer();
};
