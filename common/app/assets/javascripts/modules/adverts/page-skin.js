define([
    'common/$',
    'common/utils/mediator',
    'lodash/functions/once'
], function (
    $,
    mediator,
    once
) {

    var pageSkinHeight = 1200,
        $pageSkin = $('.ad-slot--page-skin').first(),
        $window = $(window);

    return {

        // creates a sticky page skin
        init: once(function(config) {
            if (config.page.hasPageSkin) {
                mediator.on('window:scroll', function() {
                    var contextPos = $('#js-context').offset().top,
                        maximumTop = $('.l-footer').offset().top - contextPos - pageSkinHeight;
                    $pageSkin.css('top', Math.min(Math.max(0, $window.scrollTop() - contextPos), maximumTop));
                });
            }
        })

    };

});
