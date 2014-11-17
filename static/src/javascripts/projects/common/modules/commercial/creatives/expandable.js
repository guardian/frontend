define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage'
], function (
    bean,
    bonzo,
    qwery,
    $,
    mediator,
    storage
) {

    var isClosed        = true,
        calculateHeight = function (state) {
            return state === 'open' ?
                Math.min(bonzo.viewport().height * 2 / 3, 600) :
                Math.min(bonzo.viewport().height / 3, 300);
        },
        listener = function ($ad) {
            // expires in 1 week
            var week = 1000 * 60 * 60 * 24 * 7,
                adExpandedHeight = calculateHeight('open');
            storage.local.set('gu.commercial.expandable.an-expandable', true, { expires: Date.now() + week });
            isClosed = false;

            if ((window.pageYOffset + bonzo.viewport().height) > ($ad.offset().top + adExpandedHeight)) {
                $('.ad-exp__close-button').toggleClass('button-spin');
                $ad.css('height', adExpandedHeight);
                mediator.off('window:scroll', listener);
            }
        };

    return {

        run: function () {

            var closedHeight = calculateHeight('closed'),
                $ad          = $('.ad-exp--expand').css('height', closedHeight);

            $('.ad-exp-collapse__slide').css('height', closedHeight);

            if (!storage.local.get('gu.commercial.expandable.an-expandable')) {
                mediator.on('window:scroll', listener.bind(null, $ad));
            }

            bean.on(qwery('.ad-exp__close-button')[0], 'click', function () {
                $('.ad-exp__close-button').toggleClass('button-spin');
                $ad.css('height', calculateHeight(isClosed ? 'open' : 'closed'));
                isClosed = !isClosed;
            });

        }

    };

});
