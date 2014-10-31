define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/ui/selectionSharing.html'
], function (
    bean,
    bonzo,
    _,
    $,
    config,
    detect,
    mediator,
    template,
    sharingTemplate
    ) {

    var $body = bonzo(document.body),
        $selectionSharing = $.create(sharingTemplate).hide(),
        $twitterAction,
        $emailAction,
        twitterShortUrl = config.page.shortUrl + '/stw',
        twitterHrefTemplate = 'https://twitter.com/intent/tweet?text="{{text}}"&url={{url}}',
        twitterMessageLimit = 115, // 140 - t.co length - 3 chars for quotes and url spacing
        emailShortUrl = config.page.shortUrl + '/sbl',
        emailHrefTemplate = 'mailto:?subject={{subject}}&body="{{selection}}" {{url}}',
        isBroken,

    // From https://github.com/edg2s/range-get-client-rects/blob/master/rangefix.js
    isGetClientRectsBroken = function () {
        // Check if the bug is present in the native function
        // Constructs two lines of text and creates a range between them.
        // Broken browsers will return three rectangles instead of two.
        if (isBroken === undefined) {
            var p1 = document.createElement('p'),
                p2 = document.createElement('p'),
                t1 = document.createTextNode('aa'),
                t2 = document.createTextNode('aa'),
                range = document.createRange();

            p1.appendChild(t1);
            p2.appendChild(t2);

            document.body.appendChild(p1);
            document.body.appendChild(p2);

            range.setStart(t1, 1);
            range.setEnd(t2, 1);
            isBroken = range.getClientRects().length > 2;

            document.body.removeChild(p1);
            document.body.removeChild(p2);
        }
        return isBroken;
    },

    updateSelection = function () {

        var selection = window.getSelection && document.createRange && window.getSelection(),
            range,
            rect,
            top,
            twitterMessage,
            twitterHref,
            emailHref;

        if (selection && selection.rangeCount > 0 && selection.toString()) {
            range = selection.getRangeAt(0);
            rect = getBoundingClientRect(range);
            top = $body.scrollTop() + rect.bottom;
            twitterMessage = range.toString();

            // commonAncestorContainer is buggy, can't use it here.
            if (!$.ancestor(range.startContainer, 'js-article__body') ||
                !$.ancestor(range.endContainer, 'js-article__body')) {
                $selectionSharing.hide();
                return;
            }

            // Truncate the twitter message.
            if (twitterMessage.length > twitterMessageLimit) {
                twitterMessage = twitterMessage.slice(0, twitterMessageLimit - 1) + '…';
            }

            twitterHref = template(twitterHrefTemplate, {
                text: encodeURI(twitterMessage),
                url: encodeURI(twitterShortUrl)
            });
            emailHref = template(emailHrefTemplate, {
                subject: encodeURI(config.page.webTitle),
                selection: encodeURI(range.toString()),
                url: encodeURI(emailShortUrl)
            });

            $twitterAction.attr('href', twitterHref);
            $emailAction.attr('href', emailHref);

            $selectionSharing.css({
                top: top + 'px',
                left: rect.left + 'px'
            }).show();
        } else {
            $selectionSharing.hide();
        }
    },

    // From https://github.com/edg2s/range-get-client-rects/blob/master/rangefix.js
    getClientRects = function (range) {
        if (!isGetClientRectsBroken()) {
            return range.getClientRects();
        }

        // Chrome gets the end container rects wrong when spanning
        // nodes so we need to traverse up the tree from the endContainer until
        // we reach the common ancestor, then we can add on from start to where
        // we got up to
        // https://code.google.com/p/chromium/issues/detail?id=324437
        var rects = [],
            endContainer = range.endContainer,
            endOffset = range.endOffset,
            partialRange = document.createRange();

        while (endContainer !== range.commonAncestorContainer) {
            partialRange.setStart(endContainer, 0);
            partialRange.setEnd(endContainer, endOffset);

            Array.prototype.push.apply(rects, partialRange.getClientRects());

            // The zero-based child index is the value of the offset corresponding to the nodes prior to endContainer.
            endOffset = Array.prototype.indexOf.call(endContainer.parentNode.childNodes, endContainer);
            endContainer = endContainer.parentNode;
        }

        // Once we've reached the common ancestor, add on the range from the
        // original start position to where we ended up.
        partialRange = range.cloneRange();
        partialRange.setEnd(endContainer, endOffset);
        Array.prototype.push.apply(rects, partialRange.getClientRects());
        return rects;
    },

    // From https://github.com/edg2s/range-get-client-rects/blob/master/rangefix.js
    getBoundingClientRect = function (range) {
        var i, l, boundingRect,
            rects = getClientRects(range),
            nativeBoundingRect = range.getBoundingClientRect();

        // If there are no rects return null, otherwise we'll fall through to
        // getBoundingClientRect, which in Chrome becomes [0,0,0,0].
        if (rects.length === 0) {
            return null;
        }

        if (!isGetClientRectsBroken()) {
            return range.getBoundingClientRect();
        }

        // When nativeRange is a collapsed cursor at the end of a line or
        // the start of a line, the bounding rect is [0,0,0,0] in Chrome.
        // getClientRects returns two rects, one correct, and one at the
        // end of the next line / start of the previous line. We can't tell
        // here which one to use so just pick the first. This matches
        // Firefox's behaviour, which tells you the cursor is at the end
        // of the previous line when it is at the start of the line.
        // See https://code.google.com/p/chromium/issues/detail?id=426017
        if (nativeBoundingRect.width === 0 && nativeBoundingRect.height === 0) {
            return rects[0];
        }

        for (i = 0, l = rects.length; i < l; i++) {
            boundingRect = boundingRect || {
                left: rects[i].left,
                top: rects[i].top,
                right: rects[i].right,
                bottom: rects[i].bottom
            };

            boundingRect.left = Math.min(boundingRect.left, rects[i].left);
            boundingRect.top = Math.min(boundingRect.top, rects[i].top);
            boundingRect.right = Math.max(boundingRect.right, rects[i].right);
            boundingRect.bottom = Math.max(boundingRect.bottom, rects[i].bottom);

        }
        if (boundingRect) {
            boundingRect.width = boundingRect.right - boundingRect.left;
            boundingRect.height = boundingRect.bottom - boundingRect.top;
        }
        return boundingRect;
    },

    initSelectionSharing = function () {
        // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
        // and the UI is generally fiddly on touch.
        if (!detect.hasTouchScreen()) {
            $body.append($selectionSharing);
            $twitterAction = $('.social__item--twitter .social__action');
            $emailAction = $('.social__item--email .social__action');
            // Set timeout ensures that any existing selection has been cleared.
            bean.on(document.body, 'mouseup keypress keydown keyup', _.debounce(updateSelection, 50));
            mediator.on('window:resize', _.throttle(updateSelection, 50));
        }
    };

    return {
        init: initSelectionSharing
    };
});
