define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    qwery,
    $,
    mediator
) {

    var $ad,
        isClosed = true,
        listener = function ($ad) {
            isClosed = false;
            var adExpandedHeight = Math.min(bonzo.viewport().height * 2 / 3, 600);
            if ((window.pageYOffset + bonzo.viewport().height) > ($ad.offset().top + adExpandedHeight)) {
                $ad.css('height', adExpandedHeight);
                mediator.off('window:scroll', listener);
                $('.ad-exp__close-button').toggleClass('button-spin');
            }
        };

    return {

        run: function () {

            $ad = $('.ad-exp--expand');

            $ad.css('height', Math.min(bonzo.viewport().height / 3, 300));
            $('.ad-exp-collapse__slide').css('height', Math.min(bonzo.viewport().height / 3, 300));

            mediator.on('window:scroll', listener.bind($ad));

            bean.on(qwery('.ad-exp__close-button')[0], 'click', function () {
                var height = isClosed ? Math.min(bonzo.viewport().height * 2 / 3, 600) : Math.min(bonzo.viewport().height / 3, 300);
                $('.ad-exp__close-button').toggleClass('button-spin');
                $ad.css('height', height);
                $('.ad-exp-collapse__slide').css('height', Math.min(bonzo.viewport().height / 3, 300));
                isClosed = isClosed ? false : true;
            });

        }

    };

});
