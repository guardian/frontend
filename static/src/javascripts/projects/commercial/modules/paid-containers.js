import qwery from 'qwery';
import bean from 'bean';
import fastdom from 'fastdom';

export default {
    init: init
};

function init() {
    var showMores = qwery('.adverts__more > summary');
    bean.on(document, 'click', showMores, onOpenClick);
    bean.on(document, 'click', showMores, onKeyPress(onOpenClick));

    return Promise.resolve();
}

function onKeyPress(handler) {
    return function(event) {
        if (event.keyCode === 0x20 || event.keyCode === 0x0D) {
            handler(event);
        }
    };
}

function onOpenClick(event) {
    var summary = event.currentTarget;
    var details = summary.parentNode;
    var label = summary.querySelector('.js-button__label');
    if (details.hasAttribute('open')) {
        fastdom.write(function() {
            label.textContent = 'More ' + summary.getAttribute('data-text');
        });
    } else {
        fastdom.write(function() {
            label.textContent = 'Less';
        });
    }
}
