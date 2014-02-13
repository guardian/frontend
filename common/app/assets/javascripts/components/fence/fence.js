define(function () {

    var fencedClass = 'fenced';
    var polyfilledClass = 'fenced-rendered';

    var resizeInit = 300; // milliseconds
    var resizeTimes = 12;

    // Run the callback multiple times in a loop, incrementing the
    // wait window using a fibonacci sequence
    function loop(callback, times, thisWait, lastWait) {
        lastWait = lastWait || 0;

        callback();

        if (times > 0) {
            // Schedule again and increase wait window
            setTimeout(function() {
                var nextWait = thisWait + lastWait;
                loop(callback, times - 1, nextWait, thisWait);
            }, thisWait);
        }
    }

    function done(el) {
        // We need to yield before starting this, for some reason
        setTimeout(function() {
            loop(function() {
                normalizeIframe(el);
                resizeIframe(el);
            }, resizeTimes, resizeInit);
        }, 0);
    }

    function replaceElement(elToRemove, elToInsert) {
        if (elToRemove.nextSibling) {
            elToRemove.parentNode.insertBefore(elToInsert, elToRemove.nextSibling);
        } else {
            elToRemove.parentNode.appendChild(elToInsert);
        }
        elToRemove.parentNode.removeChild(elToRemove);
    }

    function hasClass(element, className) {
        if (element.classList) {
            return element.classList.contains(className);
        } else {
            // Slightly more brittle...
            return element.className.indexOf(className) !== -1;
        }
    }

    function addClass(element, className) {
        if (element.classList) {
            return element.classList.add(className);
        } else {
            return element.className += ' ' + className;
        }
    }

    function renderAll() {
        // Get all embed iframes that have not been fully rendered yet.
        // TODO: backward compat?
        var selector = 'iframe.' + fencedClass;
        var iframes = document.querySelectorAll(selector);

        for (var i = 0, l = iframes.length; i < l; ++i) {
            render(iframes[i]);
        }
    }

    function render(iframe, options) {
        options = options || {};

        // Must only be run on <iframe>s with fenced class
        if (iframe.tagName !== 'IFRAME') {
            throw new Error('Cannot render non-iframe elements!');
        }
        if (! hasClass(iframe, fencedClass)) {
            throw new Error('Cannot render iframes with no ' + fencedClass + ' class!');
        }

        // if already polyfilled, nothing to be done (unless forced)
        var alreadyRendered = hasClass(iframe, polyfilledClass);
        if (alreadyRendered && ! options.force) {
            return;
        }

        // Reset iframe styling
        iframe.style.height = 0;
        iframe.frameBorder = 0;
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.width = '100%';

        var supportsSrcdoc = !!iframe.srcdoc;
        if (supportsSrcdoc) {
            // srcdoc is supported, add done listener (first time only)
            if (iframe.contentWindow.document.readyState === 'complete') {
                done(iframe);
            } else if (! alreadyRendered) {
                iframe.addEventListener('load', function() {
                    done(iframe);
                }, false);
            }
        } else {
            // If there's no srcdoc support write the src directly into the iframe.
            var src = iframe.getAttribute('srcdoc');
            if (src && typeof src === 'string') {
                iframe.contentWindow.contents = src;
                iframe.src = 'javascript:window["contents"]';
                done(iframe);
            }
        }

        addClass(iframe, polyfilledClass);
    }

    function normalizeIframe(iframe) {
        var doc = iframe.contentWindow && iframe.contentWindow.document;
        var body = doc && doc.body;
        if (body) {
            body.style.padding = 0;
            body.style.margin = 0;
            body.style.overflow = 'hidden';
        }
    }

    function resizeIframe(iframe) {
        var doc = iframe.contentWindow && iframe.contentWindow.document;
        if (doc) {
            var height = (doc.documentElement && doc.documentElement.scrollHeight) ||
                         (doc.body && doc.body.scrollHeight) || 0;
            iframe.style.height = height + 'px';
        }
    }

    function isSafeCode(html) {
        var holder = document.createElement('div');
        holder.innerHTML = (html || '').trim();
        var element = holder.firstChild;
        var isIframe = element && element.tagName === 'IFRAME';
        var singleChild = element && ! element.nextSibling;
        return isIframe && singleChild;
    }


    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function wrap(html) {
        if (isSafeCode(html)) {
            return html;
        } else {
            var escapedHtml = escapeHtml(html).replace(/\"/g, '&quot;');
            var htmlDoc = '<html><head></head><body>' +escapedHtml+ '</body></html>';
            return '<iframe srcdoc="' +htmlDoc+ '" class="' +fencedClass+ '"></iframe>';
        }
    }

    return {
        render: render,
        renderAll: renderAll,
        isSafeCode: isSafeCode,
        wrap: wrap
    };
});
