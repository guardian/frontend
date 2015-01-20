/* global videojs, guardian */
define([
    'bean',
    'bonzo',
    'qwery',
    'videojs',
    'videojsembed',
    'common/utils/_',
    'common/utils/defer-to-analytics',
    'common/modules/analytics/omniture',
    'common/modules/analytics/omnitureMedia',
    'common/modules/video/tech-order',
    'text!common/views/ui/loading.html'
], function (
    bean,
    bonzo,
    qwery,
    videojs,
    videojsembed,
    _,
    deferToAnalytics,
    Omniture,
    OmnitureMedia,
    techOrder,
    loadingTmpl
    ) {

    var QUARTILES = [25, 50, 75];

    function constructEventName(eventName) {
        return 'video:' + eventName;
    }

    function handleInitialMediaError(player) {
        var err = player.error();
        if (err !== null) {
            return err.code === 4;
        }
        return false;
    }

    // The Flash player does not copy its events to the dom as the HTML5 player does. This makes some
    // integrations difficult. These events are so that other libraries (e.g. Ophan) can hook into events without
    // needing to know about videojs
    function bindGlobalEvents(player) {
        player.on('playing', function () {
            bean.fire(document.body, 'videoPlaying');
        });
        player.on('pause', function () {
            bean.fire(document.body, 'videoPause');
        });
        player.on('ended', function () {
            bean.fire(document.body, 'videoEnded');
        });
    }

    function bindContentEvents(player) {
        var events = {
            end: function () {
                player.trigger(constructEventName('content:end', player));
            },
            play: function () {
                var duration = player.duration();
                if (duration) {
                    player.trigger(constructEventName('content:play', player));
                } else {
                    player.one('durationchange', events.play);
                }
            },
            timeupdate: function () {
                var progress = Math.round(parseInt(player.currentTime() / player.duration() * 100, 10));
                QUARTILES.reverse().some(function (quart) {
                    if (progress >= quart) {
                        player.trigger(constructEventName('play:' + quart, player));
                        return true;
                    } else {
                        return false;
                    }
                });
            },
            ready: function () {
                player.trigger(constructEventName('content:ready', player));

                player.one('play', events.play);
                player.on('timeupdate', _.throttle(events.timeupdate, 1000));
                player.one('ended', events.end);
            }
        };
        events.ready();
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

    function initOmnitureTracking(player) {
        new OmnitureMedia(player).init();
    }

    function initPlayer() {

        videojs.plugin('fullscreener', fullscreener);

        bonzo(qwery('.js-gu-media')).each(function (el) {
            var player,
                mouseMoveIdle;

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
                bindGlobalEvents(player);

                // unglitching the volume on first load
                vol = player.volume();
                if (vol) {
                    player.volume(0);
                    player.volume(vol);
                }

                player.fullscreener();

                deferToAnalytics(function () {
                    initOmnitureTracking(player);
                    bindContentEvents(player);
                });

                new Omniture(window.s).go();
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
