define(['fastdom', 'bean', 'lib/$'], function(fastdom, bean, $) {
    function toggleDisplay(e) {
        e && e.preventDefault();

        $('.js-social__secondary').each(function(icon) {
            fastdom.write(function() {
                $(icon).toggleClass('social--hidden');
            });
        });

        $('.js-social--top').each(function(topSocial) {
            fastdom.write(function() {
                $(topSocial).toggleClass('social--expanded-top');
            });
        });
    }

    return function hiddenShareToggle() {
        $('.js-social__item--more, .js-social__tray-close').each(function(
            toggle
        ) {
            bean.on(toggle, 'click', toggleDisplay);
        });

        bean.on(document.body, 'click', function(e) {
            if (
                $.ancestor(e.target, 'js-social--top') ||
                !$('.js-social--top').hasClass('social--expanded-top')
            )
                return;
            toggleDisplay();
        });

        fastdom.write(function() {
            $('.js-social__item--more').toggleClass('social--hidden');
        });
    };
});
