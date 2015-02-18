define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/proximity-loader',
    'common/utils/template',
    'text!common/views/content/static-social-buttons.html'
], function (
    $,
    config,
    detect,
    proximityLoader,
    template,
    staticSocialTmpl
) {
    function show() {
        $('.social-fixed').addClass('social-fixed--show');
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
            $('.meta__social').append(template(staticSocialTmpl, data));
        }

        proximityLoader.add($('.submeta-container'), 1500, show);
    }

    return init;

});
