define([
    'qwery',
    'bean',
    'fastdom'
], function (qwery, bean, fastdom) {
    var shouldWePolyfill = !('open' in document.createElement('details'));

    return {
        init: init
    };

    function init() {
        if (shouldWePolyfill) {
            bean.on(document, 'click', 'summary', onClick);
            bean.on(document, 'keypress', 'summary', onKeyPress(onClick));
        }

        var showMores = qwery('.adverts__more > summary');
        bean.on(document, 'click', showMores, onOpenClick);
        bean.on(document, 'click', showMores, onKeyPress(onOpenClick));
    }

    function onClick(event) {
        var details = event.currentTarget.parentNode;
        if (details.hasAttribute('open')) {
            fastdom.write(function () {
                details.removeAttribute('open');
            });
        } else {
            fastdom.write(function () {
                details.setAttribute('open', 'open');
            });
        }
    }

    function onKeyPress(handler) {
        return function (event) {
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
            fastdom.write(function () {
                label.textContent = 'More ' + summary.getAttribute('data-text');
            });
        } else {
            fastdom.write(function () {
                label.textContent = 'Less';
            });
        }
    }

});
