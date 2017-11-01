// @flow
import bonzo from 'bonzo';
import qwery from 'qwery';
import videojs from 'videojs';
import $ from 'lib/$';
import config from 'lib/config';
import deferToAnalytics from 'lib/defer-to-analytics';
import template from 'lodash/utilities/template';
import { Component } from 'common/modules/component';
import events from 'common/modules/video/events';
import { fullscreener } from 'common/modules/media/videojs-plugins/fullscreener';
import { inlineSvg } from 'common/views/svgs';
import loadingTmpl from 'raw-loader!common/views/ui/loading.html';
import titlebarTmpl from 'raw-loader!common/views/media/titlebar.html';
import debounce from 'lodash/functions/debounce';
import videojsOptions from 'common/modules/video/videojs-options';

const initLoadingSpinner = (player: any): void => {
    player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
};

const createVideoPlayer = (el: HTMLVideoElement, options: Object): any =>
    videojs(el, options);

const addTitleBar = (): void => {
    const data = {
        webTitle: config.get('page.webTitle'),
        pageId: config.get('page.pageId'),
        icon: inlineSvg('marque36icon'),
    };
    $('.vjs-control-bar').after(template(titlebarTmpl, data));
};

const initEndSlate = (player: any): void => {
    const endSlate = new Component();
    const endState = 'vjs-has-ended';

    endSlate.endpoint = $('.js-gu-media--enhance')
        .first()
        .attr('data-end-slate');

    endSlate.fetch(player.el(), 'html').then(() => {
        $('.end-slate-container .fc-item__action').each(e => {
            e.href += '?CMP=embed_endslate';
        });
    });

    player.on('ended', () => {
        bonzo(player.el()).addClass(endState);
    });

    player.on('playing', () => {
        bonzo(player.el()).removeClass(endState);
    });
};

const initPlayer = (): void => {
    videojs.plugin('fullscreener', fullscreener);

    bonzo(qwery('.js-gu-media--enhance')).each(el => {
        const $el = bonzo(el).addClass('vjs');
        const mediaId = $el.attr('data-media-id');
        const canonicalUrl = $el.attr('data-canonical-url');
        const gaEventLabel = canonicalUrl;
        const mediaType = el.tagName.toLowerCase();

        bonzo(el).addClass('vjs');

        const player = createVideoPlayer(
            el,
            videojsOptions({
                controls: true,
                autoplay:
                    !!window.location.hash &&
                    window.location.hash === '#autoplay',
                preload: 'metadata', // preload='none' & autoplay breaks ad loading on chrome35
                plugins: {
                    embed: {
                        embeddable:
                            config.get('switches.externalVideoEmbeds') &&
                            config.get('page.embeddable'),
                        location: `${config.get(
                            'page.externalEmbedHost'
                        )}/embed/video/${config.get('page.pageId')}`,
                    },
                },
            })
        );

        // Location of this is important
        events.handleInitialMediaError(player);

        player.ready(() => {
            initLoadingSpinner(player);
            addTitleBar();
            initEndSlate(player);

            events.bindGlobalEvents(player);

            // unglitching the volume on first load
            const vol = player.volume();
            if (vol) {
                player.volume(0);
                player.volume(vol);
            }

            player.fullscreener();

            if (config.get('switches.thirdPartyEmbedTracking')) {
                deferToAnalytics(() => {
                    events.initOphanTracking(player, mediaId);
                    events.bindContentEvents(player);
                });
            }

            events.addContentEvents(player, mediaId, mediaType);
            events.bindContentEvents(player);
            events.bindGoogleAnalyticsEvents(player, gaEventLabel);
        });

        const mouseMoveIdle = debounce(() => {
            player.removeClass('vjs-mousemoved');
        }, 500);

        // built in vjs-user-active is buggy so using custom implementation
        player.on('mousemove', () => {
            player.addClass('vjs-mousemoved');
            mouseMoveIdle();
        });
    });
};

initPlayer();
