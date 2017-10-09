import bean from 'bean';
import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'lib/$';
export default function() {
    var $jsLm = $('.js-lm');

    if ($jsLm.length > 0) {
        fastdom.write(function() {
            $('.js-wpd').addClass('content__dateline-wpd--modified');
        });

        bean.on(qwery('.js-wpd')[0], 'click', function() {
            fastdom.write(function() {
                $jsLm.toggleClass('u-h');
            });
        });
    }
};
