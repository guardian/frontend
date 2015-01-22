/* global videojs, guardian */
define([
    'bean',
    'bonzo',
    'qwery',
    'videojs',
    'videojsembed',
    'common/utils/_',
    'common/utils/config',
    'common/utils/defer-to-analytics',
    'common/modules/analytics/omniture',
    'common/modules/video/tech-order',
    'common/modules/video/events',
    'text!common/views/ui/loading.html'
], function (
    bean,
    bonzo,
    qwery,
    videojs,
    videojsembed,
    _,
    config,
    deferToAnalytics,
    Omniture,
    techOrder,
    events,
    loadingTmpl
    ) {

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    function createVideoPlayer(el, options) {
        var player;

        options.techOrder = techOrder(el);
        player = videojs(el, options);

        if (events.handleInitialMediaError(player)) {
            player.dispose();
            options.techOrder = techOrder(el).reverse();
            player = videojs(el, options);
        }

        return player;
    }

    function fullscreener() {
        var player = this,
            clickbox = bonzo.create('<div class="vjs-fullscreen-clickbox"></div>')[0],
            events = {
                click: function (e) {
                    this.paused() ? this.play() : this.pause();
                    e.stop();
                },
                dblclick: function (e) {
                    e.stop();
                    this.isFullScreen() ? this.exitFullscreen() : this.requestFullscreen();
                }
            };

        bonzo(clickbox)
            .appendTo(player.contentEl());

        bean.on(clickbox, 'click', events.click.bind(player));
        bean.on(clickbox, 'dblclick', events.dblclick.bind(player));
    }

    function initPlayer() {

        videojs.plugin('fullscreener', fullscreener);

        bonzo(qwery('.js-gu-media')).each(function (el) {
            var player,
                mouseMoveIdle,
                $el = bonzo(el).addClass('vjs vjs-tech-' + videojs.options.techOrder[0]),
                mediaId = $el.attr('data-media-id');

            bonzo(el).addClass('vjs');

            player = createVideoPlayer(el, {
                controls: true,
                autoplay: false,
                preload: 'metadata', // preload='none' & autoplay breaks ad loading on chrome35
                plugins: {
                    embed: {
                        embeddable: guardian.config.switches.externalVideoEmbeds && guardian.config.page.embeddable,
                        location: 'https://embed.theguardian.com/embed/video/' + guardian.config.page.pageId
                    }
                }
            });

            //Location of this is important
            events.handleInitialMediaError(player);

            player.ready(function () {
                var vol;

                initLoadingSpinner(player);
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
                        events.initOmnitureTracking(player);
                        events.bindContentEvents(player);
                    });

                    new Omniture(window.s).go();
                }
            });

            mouseMoveIdle = _.debounce(function () { player.removeClass('vjs-mousemoved'); }, 500);

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
/* jshint unused: false */
/* global guardian */
