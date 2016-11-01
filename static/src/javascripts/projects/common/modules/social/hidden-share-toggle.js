define([
    'fastdom',
    'bean',
    'common/utils/$'
], function (
    fastdom,
    bean,
    $
) {

    function toggleDisplay (_) {

        $('.social__secondary').each(function (icon){
            fastdom.write(function () {
                $(icon).toggleClass('social--hidden');
            });
        });

        $('.social--top').each(function (topSocial) {
            fastdom.write(function () {
                $(topSocial).toggleClass('social--expanded-top')
            });
        });

        $('.social-icon').each(function (icon) {
            fastdom.write(function () {
                $(icon).toggleClass('social-icon--expanded-top')
            })
        })
    }

    return function hiddenShareToggle () {
        $('.social-icon--more, .social__tray-close').each(function (toggle) {
            bean.on(toggle, 'click', toggleDisplay);
        });
    }
});
