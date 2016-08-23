define([
    'common/utils/fastdom-promise',
    'bean'
], function (fastdomPromise, bean) {
    var weShouldPolyfill = !('open' in document.createElement('details'));
    var boundEvents = {};

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

    function bindEvents(summarySelector) {
        if (boundEvents[summarySelector]) {
            return;
        }
        bean.on(document, 'click', summarySelector, function(event) {
            onClick(event);
        });
        bean.on(document, 'keypress', summarySelector, function(event) {
            if (event.keyCode === 0x20 || event.keyCode === 0x0D) {
                onClick(event);
            }
        });
        boundEvents[summarySelector] = true;
    }

    function appendCss() {
        if(document.querySelector('#details-polyfill-css') === null) {
            var style = document.createElement('style');

            style.id = 'details-polyfill-css';
            style.textContent = 'details:not([open]) > *:not(summary) {display: none;}';

            document.head.insertBefore(style, document.head.firstChild);
        }
    }

    return {
        init: function (summarySelector) {
            if(weShouldPolyfill) {
                bindEvents(summarySelector || 'summary');
                appendCss();
            }
        }
    };
});
