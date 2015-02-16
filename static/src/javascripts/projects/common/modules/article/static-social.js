define([
    'common/utils/$',
    'common/utils/proximity-loader',
    'common/utils/template',
    'text!common/views/content/static-facebook.html'
], function (
    $,
    proximityLoader,
    template,
    staticFacebookTmpl
) {
    function show() {
        $('.social-fixed--facebook').addClass('social-fixed--show');
    }

    function init() {
        if(window.location.href.match(/[?&]CMP=([^&#]+)/)[1] == 'share_btn_fb') {
            $('.meta__social').append(template(staticFacebookTmpl));
        }

        proximityLoader.add($('.content-footer'), 1500, show);
    }

    return init;

});
