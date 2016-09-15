@()

(function (window, document) {
    var weShouldPolyfill = !('open' in document.createElement('details'));

    function toggleDetailsState(details) {
        if (details.hasAttribute('open')) {
            details.removeAttribute('open');
        } else {
            details.setAttribute('open', 'open');
        }
    }

    function handleEvent(event) {
        var targetNode = event.target;

        while (targetNode.nodeName.toLowerCase() !== 'summary' && targetNode !== document) {
            targetNode = targetNode.parentNode;
        }
        if (targetNode.nodeName.toLowerCase() === 'summary') {
            toggleDetailsState(targetNode.parentNode);
        }
    }

    function bindEvents() {
        document.addEventListener('click', handleEvent);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 0x20 || event.keyCode === 0x0D) {
                handleEvent(event);
            }
        });
    }

    function appendCss() {
        if (document.querySelector('#details-polyfill-css') === null) {
            var style = document.createElement('style');

            style.id = 'details-polyfill-css';
            style.textContent = 'details:not([open]) > *:not(summary) {display: none;}';

            document.head.insertBefore(style, document.head.firstChild);
        }
    }

    if (weShouldPolyfill) {
        bindEvents();
        appendCss();
    }
})(window, document);
