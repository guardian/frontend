// @flow
import videojs from 'videojs';
import 'videojs-embed';
import { $ } from 'lib/$';
import config from 'lib/config';
import deferToAnalytics from 'lib/defer-to-analytics';
import template from 'lodash/template';
import events from 'common/modules/video/events';
import { fullscreener } from 'common/modules/media/videojs-plugins/fullscreener';
import { inlineSvg } from 'common/views/svgs';
import loadingTmpl from 'raw-loader!common/views/ui/loading.html';
import titlebarTmpl from 'raw-loader!common/views/media/titlebar.html';
import debounce from 'lodash/debounce';
import videojsOptions from 'common/modules/video/videojs-options';

// Let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.get('page.assetsPath')}javascripts/`;

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
    $('.vjs-control-bar').after(template(titlebarTmpl)(data));
};

const initPlayer = (): void => {
    videojs.plugin('fullscreener', fullscreener);

    $('.js-gu-media--enhance').each(el => {
        const $el = $(el).addClass('vjs');
        const mediaId = $el.attr('data-media-id');
        const canonicalUrl = $el.attr('data-canonical-url');
        const gaEventLabel = canonicalUrl;
        const mediaType = el.tagName.toLowerCase();

        $(el).addClass('vjs');

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
