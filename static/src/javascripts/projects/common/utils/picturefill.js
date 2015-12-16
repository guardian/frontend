/*! Picturefill - v2.3.0-beta - 2015-02-25
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = (function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media), style, script, info;

    // For those that don't support matchMedium
    if (!styleMedia) {
        style       = document.createElement('style');
        script      = document.getElementsByTagName('script')[0];
        info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function (media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function (media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}()));
define([
    'fastdom'
], function (
    fastdom
) {

    /*! Picturefill - Responsive Images that work today.
    *  Author: Scott Jehl, Filament Group, 2012 (new proposal implemented by Shawn Jansepar)
    *  License: MIT/GPLv2
    *  Spec: http://picture.responsiveimages.org/
    */
    return (function (w, doc, image) {
        // Enable strict mode
        'use strict';

        // If picture is supported, well, that's awesome. Let's get outta here...
        if (w.HTMLPictureElement) {
            // return expose(function () {});
            return function () {};
        }

        // HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
        doc.createElement('picture');

        // local object for method references and testing exposure
        var pf = w.picturefill || {},
            regWDesc = /\s+\+?\d+(e\d+)?w/;

        // namespace
        pf.ns = 'picturefill';

        // srcset support test
        (function () {
            pf.srcsetSupported = 'srcset' in image;
            pf.sizesSupported = 'sizes' in image;
            pf.curSrcSupported = 'currentSrc' in image;
        })();

        // just a string trim workaround
        pf.trim = function (str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        };

        /**
         * Gets a string and returns the absolute URL
         * @param src
         * @returns {String} absolute URL
         */
        pf.makeUrl = (function () {
            var anchor = doc.createElement('a');
            return function (src) {
                anchor.href = src;
                return anchor.href;
            };
        })();

        /**
         * Shortcut method for matchMedia (for easy overriding in tests)
         */
        // IE8 and below can't be polyfilled
        pf.canMatchMedia = w.matchMedia && w.matchMedia('(min-width: 0px)').matches;

        pf.matchesMedia = function (media) {
            if (!pf.canMatchMedia) {
                return true;
            }
            return w.matchMedia && w.matchMedia(media).matches;
        };

        // Shortcut method for `devicePixelRatio` (for easy overriding in tests)
        pf.getDpr = function () {
            return (w.devicePixelRatio || 1);
        };

        /**
         * Get width in css pixel value from a 'length' value
         * http://dev.w3.org/csswg/css-values-3/#length-value
         */
        pf.getWidthFromLength = function (length) {
            length = length.replace('vw', '%');
            if (length.indexOf('%') > -1) {
                length = pf.viewportWidth * parseInt(length, 10) * 0.01;
            } else {
                length = parseInt(length, 10);
            }

            return length;
        };

        // Parses an individual `size` and returns the length, and optional media query
        pf.parseSize = function (sourceSizeStr) {
            var match = /(\([^)]+\))?\s*(.+)/g.exec(sourceSizeStr);
            return {
                media: match && match[1],
                length: match && match[2]
            };
        };

        // Takes a string of sizes and returns the width in pixels as a number
        pf.findWidthFromSourceSize = function (sourceSizeListStr) {
            // Split up source size list, ie (max-width: 30em) 100%, (max-width: 50em) 50%, 33%
            //                            or (min-width:30em) calc(30% - 15px)
            var sourceSizeList = pf.trim(sourceSizeListStr).split(/\s*,\s*/),
                winningLength,
                i, len,
                sourceSize,
                parsedSize,
                length,
                media;

            for (i = 0, len = sourceSizeList.length; i < len; i++) {
                // Match <media-condition>? length, ie (min-width: 50em) 100%
                sourceSize = sourceSizeList[ i ];
                // Split '(min-width: 50em) 100%' into separate strings
                parsedSize = pf.parseSize(sourceSize);
                length = parsedSize.length;
                media = parsedSize.media;

                if (!length) {
                    // jscs:disable disallowKeywords
                    continue;
                    // jscs:enable disallowKeywords
                }
                // if there is no media query or it matches, choose this as our winning length
                if ((!media || pf.matchesMedia(media)) &&
                    // pass the length to a method that can properly determine length
                    // in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
                    (winningLength = pf.getWidthFromLength(length))) {
                    break;
                }
            }

            //if we have no winningLength fallback to 100vw
            return winningLength || pf.viewportWidth;
        };

        pf.parseSrcset = function (srcset) {
            /**
             * A lot of this was pulled from Boris Smus’ parser for the now-defunct WHATWG `srcset`
             * https://github.com/borismus/srcset-polyfill/blob/master/js/srcset-info.js
             *
             * 1. Let input (`srcset`) be the value passed to this algorithm.
             * 2. Let position be a pointer into input, initially pointing at the start of the string.
             * 3. Let raw candidates be an initially empty ordered list of URLs with associated
             *    unparsed descriptors. The order of entries in the list is the order in which entries
             *    are added to the list.
             */
            var candidates = [], pos, url, descriptor, last, descpos;

            while (srcset !== '') {
                srcset = srcset.replace(/^\s+/g, '');

                // 5. Collect a sequence of characters that are not space characters, and let that be url.
                pos = srcset.search(/\s/g);
                descriptor = null;

                if (pos !== -1) {
                    url = srcset.slice(0, pos);

                    last = url.slice(-1);

                    // 6. If url ends with a U+002C COMMA character (,), remove that character from url
                    // and let descriptors be the empty string. Otherwise, follow these substeps
                    // 6.1. If url is empty, then jump to the step labeled descriptor parser.

                    if (last === ',' || url === '') {
                        url = url.replace(/,+$/, '');
                        descriptor = '';
                    }
                    srcset = srcset.slice(pos + 1);

                    // 6.2. Collect a sequence of characters that are not U+002C COMMA characters (,), and
                    // let that be descriptors.
                    if (descriptor === null) {
                        descpos = srcset.indexOf(',');
                        if (descpos !== -1) {
                            descriptor = srcset.slice(0, descpos);
                            srcset = srcset.slice(descpos + 1);
                        } else {
                            descriptor = srcset;
                            srcset = '';
                        }
                    }
                } else {
                    url = srcset;
                    srcset = '';
                }

                // 7. Add url to raw candidates, associated with descriptors.
                if (url || descriptor) {
                    candidates.push({
                        url: url,
                        descriptor: descriptor
                    });
                }
            }
            return candidates;
        };

        pf.parseDescriptor = function (descriptor, sizesattr) {
            // 11. Descriptor parser: Let candidates be an initially empty source set. The order of entries in the list
            // is the order in which entries are added to the list.
            var sizes = sizesattr || '100vw',
                sizeDescriptor = descriptor && descriptor.replace(/(^\s+|\s+$)/g, ''),
                widthInCssPixels = pf.findWidthFromSourceSize(sizes),
                resCandidate,
                splitDescriptor,
                i,
                curr,
                res,
                lastchar;

            if (sizeDescriptor) {
                splitDescriptor = sizeDescriptor.split(' ');

                for (i = splitDescriptor.length - 1; i >= 0; i--) {
                    curr = splitDescriptor[ i ];
                    lastchar = curr && curr.slice(curr.length - 1);

                    if ((lastchar === 'h' || lastchar === 'w') && !pf.sizesSupported) {
                        resCandidate = parseFloat((parseInt(curr, 10) / widthInCssPixels));
                    } else if (lastchar === 'x') {
                        res = curr && parseFloat(curr, 10);
                        resCandidate = res && !isNaN(res) ? res : 1;
                    }
                }
            }
            return resCandidate || 1;
        };

        /**
         * Takes a srcset in the form of url/
         * ex. 'images/pic-medium.png 1x, images/pic-medium-2x.png 2x' or
         *     'images/pic-medium.png 400w, images/pic-medium-2x.png 800w' or
         *     'images/pic-small.png'
         * Get an array of image candidates in the form of
         *      {url: '/foo/bar.png', resolution: 1}
         * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
         * If sizes is specified, resolution is calculated
         */
        pf.getCandidatesFromSourceSet = function (srcset, sizes) {
            var candidates = pf.parseSrcset(srcset),
                formattedCandidates = [],
                candidate,
                i, len;

            for (i = 0, len = candidates.length; i < len; i++) {
                candidate = candidates[ i ];

                formattedCandidates.push({
                    url: candidate.url,
                    resolution: pf.parseDescriptor(candidate.descriptor, sizes)
                });
            }
            return formattedCandidates;
        };

        /**
         * if it's an img element and it has a srcset property,
         * we need to remove the attribute so we can manipulate src
         * (the property's existence infers native srcset support, and a srcset-supporting browser will prioritize srcset's value over our winning picture candidate)
         * this moves srcset's value to memory for later use and removes the attr
         */
        pf.dodgeSrcset = function (img) {
            if (img.srcset) {
                img[ pf.ns ].srcset = img.srcset;
                img.srcset = '';
                img.setAttribute('data-pfsrcset', img[ pf.ns ].srcset);
            }
        };

        // Accept a source or img element and process its srcset and sizes attrs
        pf.processSourceSet = function (el) {
            var srcset = el.getAttribute('srcset'),
                sizes = el.getAttribute('sizes'),
                candidates = [];

            // if it's an img element, use the cached srcset property (defined or not)
            if (el.nodeName.toUpperCase() === 'IMG' && el[ pf.ns ] && el[ pf.ns ].srcset) {
                srcset = el[ pf.ns ].srcset;
            }

            if (srcset) {
                candidates = pf.getCandidatesFromSourceSet(srcset, sizes);
            }
            return candidates;
        };

        pf.applyBestCandidate = function (candidates, picImg) {
            var candidate,
                length,
                bestCandidate,
                i;

            candidates.sort(pf.ascendingSort);

            length = candidates.length;
            bestCandidate = candidates[ length - 1 ];

            for (i = 0; i < length; i++) {
                candidate = candidates[ i ];
                if (candidate.resolution >= pf.getDpr()) {
                    bestCandidate = candidate;
                    break;
                }
            }

            if (bestCandidate) {

                bestCandidate.url = pf.makeUrl(bestCandidate.url);

                if (picImg.src !== bestCandidate.url) {
                    fastdom.write(function () {
                        picImg.src = bestCandidate.url;
                        // currentSrc attribute and property to match
                        // http://picture.responsiveimages.org/#the-img-element
                        if (!pf.curSrcSupported) {
                            picImg.currentSrc = picImg.src;
                        }
                    });
                }
            }
        };

        pf.ascendingSort = function (a, b) {
            return a.resolution - b.resolution;
        };

        /**
         * In IE9, <source> elements get removed if they aren't children of
         * video elements. Thus, we conditionally wrap source elements
         * using <!--[if IE 9]><video style="display: none;"><![endif]-->
         * and must account for that here by moving those source elements
         * back into the picture element.
         */
        pf.removeVideoShim = function (picture) {
            var videos = picture.getElementsByTagName('video');
            if (videos.length) {
                var video = videos[0],
                    vsources = video.getElementsByTagName('source');
                while (vsources.length) {
                    picture.insertBefore(vsources[0], video);
                }
                // Remove the video element once we're finished removing its children
                video.parentNode.removeChild(video);
            }
        };

        /**
         * Find all `img` elements, and add them to the candidate list if they have
         * a `picture` parent, a `sizes` attribute in basic `srcset` supporting browsers,
         * a `srcset` attribute at all, and they haven’t been evaluated already.
         */
        pf.getAllElements = function () {
            var elems = [],
                imgs = doc.getElementsByTagName('img'),
                currImg,
                h, len;

            for (h = 0, len = imgs.length; h < len; h++) {
                currImg = imgs[ h ];

                if (currImg.parentNode.nodeName.toUpperCase() === 'PICTURE' ||
                (currImg.getAttribute('srcset') !== null) || currImg[ pf.ns ] && currImg[ pf.ns ].srcset !== null) {
                    elems.push(currImg);
                }
            }
            return elems;
        };

        pf.getMatch = function (img, picture) {
            var sources = picture.childNodes,
                match;

            // Go through each child, and if they have media queries, evaluate them
            for (var j = 0, slen = sources.length; j < slen; j++) {
                var source = sources[ j ];

                // ignore non-element nodes
                if (source.nodeType !== 1) {
                    // jscs:disable disallowKeywords
                    continue;
                    // jscs:enable disallowKeywords
                }

                // Hitting the `img` element that started everything stops the search for `sources`.
                // If no previous `source` matches, the `img` itself is evaluated later.
                if (source === img) {
                    return match;
                }

                // ignore non-`source` nodes
                if (source.nodeName.toUpperCase() !== "SOURCE") {
                    // jscs:disable disallowKeywords
                    continue;
                    // jscs:enable disallowKeywords
                }
                // if it's a source element that has the `src` property set, throw a warning in the console
                if (source.getAttribute("src") !== null && typeof console !== undefined) {
                    console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");
                }

                var media = source.getAttribute("media");

                // if source does not have a srcset attribute, skip
                if (!source.getAttribute("srcset")) {
                    // jscs:disable disallowKeywords
                    continue;
                    // jscs:enable disallowKeywords
                }

                // if there's no media specified, OR w.matchMedia is supported
                if ((!media || pf.matchesMedia(media))) {
                    match = source;
                    break;
                }
            }

            return match;
        };

        function picturefill(opt) {
            var elements,
                element,
                parent,
                firstMatch,
                candidates,
                options = opt || {};

            elements = options.elements || pf.getAllElements;

            // w._browserWidth = pf.getBrowserWidth();

            fastdom.read(function () {
                pf.viewportWidth = Math.max(w.innerWidth || 0, doc.documentElement.clientWidth);
                // Loop through all elements
                for (var i = 0, plen = elements.length; i < plen; i++) {
                    element = elements[ i ];
                    parent = element.parentNode;
                    firstMatch = undefined;
                    candidates = undefined;

                    // immediately skip non-`img` nodes
                    if (element.nodeName.toUpperCase() !== 'IMG') {
                        // jscs:disable disallowKeywords
                        continue;
                        // jscs:enable disallowKeywords
                    }

                    // expando for caching data on the img
                    if (!element[ pf.ns ]) {
                        element[ pf.ns ] = {};
                    }

                    // if the element has already been evaluated, skip it unless
                    // `options.reevaluate` is set to true (this, for example,
                    // is set to true when running `picturefill` on `resize`).
                    if (!options.reevaluate && element[ pf.ns ].evaluated) {
                        // jscs:disable disallowKeywords
                        continue;
                        // jscs:enable disallowKeywords
                    }

                    // if `img` is in a `picture` element
                    if (parent && parent.nodeName.toUpperCase() === "PICTURE") {

                        // IE9 video workaround
                        pf.removeVideoShim(parent);

                        // return the first match which might undefined
                        // returns false if there is a pending source
                        // TODO the return type here is brutal, cleanup
                        firstMatch = pf.getMatch(element, parent);

                        // if any sources are pending in this picture due to async type test(s)
                        // remove the evaluated attr and skip for now ( the pending test will
                        // rerun picturefill on this element when complete)
                        if (firstMatch === false) {
                            // jscs:disable disallowKeywords
                            continue;
                            // jscs:enable disallowKeywords
                        }
                    } else {
                        firstMatch = undefined;
                    }

                    // Cache and remove `srcset` if present and we’re going to be doing `picture`/`srcset`/`sizes` polyfilling to it.
                    if ((parent && parent.nodeName.toUpperCase() === "PICTURE") ||
                    (!pf.sizesSupported && (element.srcset && regWDesc.test(element.srcset)))) {
                        pf.dodgeSrcset(element);
                    }

                    if (firstMatch) {
                        candidates = pf.processSourceSet(firstMatch);
                        pf.applyBestCandidate(candidates, element);
                    } else {
                        // No sources matched, so we’re down to processing the inner `img` as a source.
                        candidates = pf.processSourceSet(element);

                        if (element.srcset === undefined || element[ pf.ns ].srcset) {
                            // Either `srcset` is completely unsupported, or we need to polyfill `sizes` functionality.
                            pf.applyBestCandidate(candidates, element);
                        } // Else, resolution-only `srcset` is supported natively.
                    }

                    // set evaluated to true to avoid unnecessary reparsing
                    element[ pf.ns ].evaluated = true;
                }
            });
        }

        /* expose methods for testing */
        picturefill._ = pf;

        // expose(picturefill);
        return picturefill;

    })(window, window.document, new window.Image());
});
