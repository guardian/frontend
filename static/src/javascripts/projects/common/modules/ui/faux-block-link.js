import bean from 'bean';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import $ from 'lib/$';
var overlaySelector = '.u-faux-block-link__overlay',
    hoverStateClassName = 'u-faux-block-link--hover';

export default function() {
    var showIntentToClick = function(e) {
        fastdom.write(function() {
            $(e.currentTarget).parent().addClass(hoverStateClassName);
        });
    };
    var removeIntentToClick = function(e) {
        fastdom.write(function() {
            $(e.currentTarget).parent().removeClass(hoverStateClassName);
        });
    };

    // mouseover
    bean.on(document.body, 'mouseenter', overlaySelector, showIntentToClick);
    // mouseout
    bean.on(document.body, 'mouseleave', overlaySelector, removeIntentToClick);
};
