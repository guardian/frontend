define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/modules/analytics/beacon'
], function (
    bean,
    fastdom,
    $,
    beacon
) {

    return {
        init: function () {
                var link = $('.js-tech-feedback');
                bean.on(link[0], 'click', function (e) {
                    beacon.fire('/counts.gif?c=tech-feedback');
                    fastdom.write(function () {
                        $('.js-feedback-thanks').removeClass('footer__feedback--hide');
                        link.addClass('footer__feedback--hide');
                    });
                });
                link.removeClass('footer__feedback--hide');
        }
    };
});
