define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/proximity-loader',
    'common/utils/template',
    'lodash/functions/debounce',
    'text!common/views/content/static-social-buttons.html'
], function (
    fastdom,
    $,
    config,
    detect,
    mediator,
    proximityLoader,
    template,
    debounce,
    staticSocialTmpl
) {
    function show() {
        fastdom.read(function () {
            if (($(document.body).scrollTop() > $('.meta__extras').offset().top)) {
                fastdom.write(function () {
                    $('.social-fixed').addClass('social-fixed--show');
                });
            }
        });
    }

    function init() {
        var blockShortUrl = config.page.shortUrl,
            data = {
                fbUrl: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(blockShortUrl) + '/sfb',
                twUrl: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(config.page.webTitle) + '&url=' + encodeURIComponent(blockShortUrl) + '/stw'
            },
            match = window.location.href.match(/[?&]CMP=([^&#]+)/);

        if (config.switches.staticSocialIconMobile && detect.isBreakpoint({ max: 'phablet' }) &&
            match && ['share_btn_fb', 'share_btn_tw'].indexOf(match[1]) > -1) {
            fastdom.write(function () {
                $('.meta__social').append(template(staticSocialTmpl, data));
            });
        }

        mediator.on('window:scroll', debounce(show, 200));
    }

    return init;

});
