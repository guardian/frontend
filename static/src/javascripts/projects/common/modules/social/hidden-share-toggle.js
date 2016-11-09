define([
    'fastdom',
    'bean',
    'common/utils/$'
], function (
    fastdom,
    bean,
    $
) {

    function toggleDisplay (e) {

        e.preventDefault();

        $('.js-social__secondary').each(function (icon){
            fastdom.write(function () {
                $(icon).toggleClass('social--hidden');
            });
        });

        $('.js-social--top').each(function (topSocial) {
            fastdom.write(function () {
                $(topSocial).toggleClass('social--expanded-top');
            });
        });

        $('.social-icon').each(function (icon) {
            fastdom.write(function () {
                $(icon).toggleClass('social-icon--expanded-top');
            });
        });
    }

    return function hiddenShareToggle () {
        $('.js-social__item--more, .js-social__tray-close').each(function (toggle) {
            bean.on(toggle, 'click', toggleDisplay);
        });

        fastdom.write(function () {
            $('.js-social__item--more').toggleClass('social--hidden');
        });
    };
});
