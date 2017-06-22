define(function() {
    // From https://github.com/edg2s/range-get-client-rects/blob/master/rangefix.js
    var isBroken,
        isGetClientRectsBroken = function() {
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
        getClientRects = function(range) {
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

                Array.prototype.push.apply(
                    rects,
                    partialRange.getClientRects()
                );

                // The zero-based child index is the value of the offset corresponding to the nodes prior to endContainer.
                endOffset = Array.prototype.indexOf.call(
                    endContainer.parentNode.childNodes,
                    endContainer
                );
                endContainer = endContainer.parentNode;
            }

            // Once we've reached the common ancestor, add on the range from the
            // original start position to where we ended up.
            partialRange = range.cloneRange();
            partialRange.setEnd(endContainer, endOffset);
            Array.prototype.push.apply(rects, partialRange.getClientRects());
            return rects;
        },
        getBoundingClientRect = function(range) {
            var i,
                l,
                boundingRect,
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
            if (
                nativeBoundingRect.width === 0 &&
                nativeBoundingRect.height === 0
            ) {
                return rects[0];
            }

            for (i = 0, l = rects.length; i < l; i++) {
                boundingRect = boundingRect || {
                    left: rects[i].left,
                    top: rects[i].top,
                    right: rects[i].right,
                    bottom: rects[i].bottom,
                };

                boundingRect.left = Math.min(boundingRect.left, rects[i].left);
                boundingRect.top = Math.min(boundingRect.top, rects[i].top);
                boundingRect.right = Math.max(
                    boundingRect.right,
                    rects[i].right
                );
                boundingRect.bottom = Math.max(
                    boundingRect.bottom,
                    rects[i].bottom
                );
            }
            if (boundingRect) {
                boundingRect.width = boundingRect.right - boundingRect.left;
                boundingRect.height = boundingRect.bottom - boundingRect.top;
            }
            return boundingRect;
        };

    return {
        getClientRects: getClientRects,
        getBoundingClientRect: getBoundingClientRect,
    };
});
