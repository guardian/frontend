define([
    'common/utils/fastdom-promise'
], function (fastdomPromise) {
    var shouldWePolyfill = !('open' in document.createElement('details'));

    function onClick(event) {
        var details = event.target.parentNode;

        if (details.hasAttribute('open')) {
            fastdomPromise.write(function () {
                details.removeAttribute('open');
            });
        } else {
            fastdomPromise.write(function () {
                details.setAttribute('open', '');
            });
        }
    }

    function bindEvents() {
        document.addEventListener('click', function(event) {
            if (event.target.tagName.toLowerCase() === 'summary') {
                onClick(event);
            }
        });
    }

    function appendCss() {
        if(document.querySelector('#details-polyfill-css') === null) {
            var style = document.createElement('style');

            style.id = 'details-polyfill-css';
            style.textContent = 'details:not([open]) > *:not(summary) { display: none; }';

            document.head.insertBefore(style, document.head.firstChild);
        }
    }

    if(shouldWePolyfill) {
        bindEvents();
        appendCss();
    }
});
