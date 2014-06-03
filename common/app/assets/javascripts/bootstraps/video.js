/* global videojs */
define([
    'common/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/adverts/video'

], function(
    $,
    detect,
    mediator,
    VideoAdvert
) {

    var modules = {

        initPlayer: function() {
            require('js!videojs', function() {
                $('video').each(function(el) {
                    videojs(el, {
                        controls: true,
                        autoplay: false,
                        preload: 'none'
                    }).ready(function() {
                        mediator.emit('video:load:advert', this);
                    });
                });
            });
        },

        loadVideoAdverts: function () {
            mediator.on('page:common:ready', function (config, context) {
                if (config.switches.videoAdverts && !config.page.blockVideoAds) {
                    Array.prototype.forEach.call(context.querySelectorAll('video'), function (el) {
                        var support = detect.getVideoFormatSupport();
                        new VideoAdvert({
                            el: el,
                            support: support,
                            config: config,
                            context: context
                        }).init(config.page);
                    });
                } else {
                    mediator.emit('video:ads:finished', config, context);
                }
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
        }
        modules.initPlayer();
        mediator.emit('page:video:ready', config, context);
    };

    return {
        init: ready
    };
});
