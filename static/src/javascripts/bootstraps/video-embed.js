/* jshint unused: false */
/* global guardian */
define([
    'bean',
    'bonzo',
    'qwery',
    'videojs',
    'videojsembed',
    'lodash/functions/debounce',
    'common/modules/video/tech-order',
    'text!common/views/ui/loading.html'
], function (
    bean,
    bonzo,
    qwery,
    videojs,
    videojsembed,
    debounce,
    techOrder,
    loadingTmpl
) {

    function handleInitialMediaError(player) {
        var err = player.error();
        if (err !== null) {
            return err.code === 4;
        }
        return false;
    }

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    function createVideoPlayer(el, options) {
        var player;

        options.techOrder = techOrder(el);
        player = videojs(el, options);

        if (handleInitialMediaError(player)) {
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

        bonzo(qwery('.js-gu-media--enhance')).each(function (el) {
            var player, mouseMoveIdle;

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
            handleInitialMediaError(player);

            player.ready(function () {
                var vol;

                initLoadingSpinner(player);

                // unglitching the volume on first load
                vol = player.volume();
                if (vol) {
                    player.volume(0);
                    player.volume(vol);
                }

                player.fullscreener();

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
