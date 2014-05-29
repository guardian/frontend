define([
    'common/$',
    'common/utils/mediator',
    'lodash/functions/once'
], function (
    $,
    mediator,
    once
) {

    var pageskinHeight = 1200,
        $pageskin = $('.ad-slot--pageskin').first(),
        $window = $(window);

    return {

        // creates a sticky pageskin
        init: once(function() {
            mediator.on('window:scroll', function() {
                var contextPos = $('#js-context').offset().top,
                    maximumTop = $('.l-footer').offset().top - contextPos - pageskinHeight;
                $pageskin.css('top', Math.min(Math.max(0, $window.scrollTop() - contextPos), maximumTop));
            });
        })

    };

});
