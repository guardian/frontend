define([
    'bonzo',
    'qwery',
    'videojs',
    'videojs-embed',
    'lib/$',
    'lib/config',
    'lib/defer-to-analytics',
    'lodash/utilities/template',
    'common/modules/component',
    'common/modules/video/events',
    'common/modules/media/videojs-plugins/fullscreener',
    'common/views/svgs',
    'raw-loader!common/views/ui/loading.html',
    'raw-loader!common/views/media/titlebar.html',
    'lodash/functions/debounce',
    'common/modules/video/videojs-options'
], function (
    bonzo,
    qwery,
    videojs,
    videojsembed,
    $,
    config,
    deferToAnalytics,
    template,
    Component,
    events,
    fullscreener,
    svgs,
    loadingTmpl,
    titlebarTmpl,
    debounce,
    videojsOptions
) {

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    function createVideoPlayer(el, options) {
        var player = videojs(el, options);

        return player;
    }

    function addTitleBar() {
        var data = {
            webTitle: config.page.webTitle,
            pageId: config.page.pageId,
            icon: svgs.inlineSvg('marque36icon')
        };
        $('.vjs-control-bar').after(template(titlebarTmpl, data));
    }

    function initEndSlate(player) {
        var endSlate = new Component(),
            endState = 'vjs-has-ended';

        endSlate.endpoint = $('.js-gu-media--enhance').first().attr('data-end-slate');

        endSlate.fetch(player.el(), 'html').then(function () {
            $('.end-slate-container .fc-item__action').each(function (e) { e.href += '?CMP=embed_endslate'; });
        });

        player.on('ended', function () {
            bonzo(player.el()).addClass(endState);
        });

        player.on('playing', function () {
            bonzo(player.el()).removeClass(endState);
        });
    }

    function initPlayer() {

        videojs.plugin('fullscreener', fullscreener.fullscreener);

        bonzo(qwery('.js-gu-media--enhance')).each(function (el) {
            var player,
                mouseMoveIdle,
                $el = bonzo(el).addClass('vjs'),
                mediaId = $el.attr('data-media-id'),
                canonicalUrl = $el.attr('data-canonical-url'),
                gaEventLabel = canonicalUrl,
                mediaType = el.tagName.toLowerCase();

            bonzo(el).addClass('vjs');

            player = createVideoPlayer(el, videojsOptions({
                controls: true,
                autoplay: !!window.location.hash && window.location.hash === '#autoplay',
                preload: 'metadata', // preload='none' & autoplay breaks ad loading on chrome35
                plugins: {
                    embed: {
                        embeddable: config.switches.externalVideoEmbeds && config.page.embeddable,
                        location: config.page.externalEmbedHost + '/embed/video/' + config.page.pageId
                    }
                }
            }));

            //Location of this is important
            events.handleInitialMediaError(player);

            player.ready(function () {
                var vol;

                initLoadingSpinner(player);
                addTitleBar();
                initEndSlate(player);

                events.bindGlobalEvents(player);

                // unglitching the volume on first load
                vol = player.volume();
                if (vol) {
                    player.volume(0);
                    player.volume(vol);
                }

                player.fullscreener();

                if (config.switches.thirdPartyEmbedTracking) {
                    deferToAnalytics(function () {
                        events.initOphanTracking(player, mediaId);
                        events.bindContentEvents(player);
                    });

                }

                events.addContentEvents(player, mediaId, mediaType);
                events.bindContentEvents(player);
                events.bindGoogleAnalyticsEvents(player, gaEventLabel);
            });

            mouseMoveIdle = debounce(function () { player.removeClass('vjs-mousemoved'); }, 500);

            // built in vjs-user-active is buggy so using custom implementation
            player.on('mousemove', function () {
                player.addClass('vjs-mousemoved');
                mouseMoveIdle();
            });
        });
    }

    return {
        init: initPlayer
    };
});
