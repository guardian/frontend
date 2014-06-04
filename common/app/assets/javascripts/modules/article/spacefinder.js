define(['bonzo','qwery', 'common/_', 'common/$'], function(bonzo, qwery, _, $) {
    // find spaces in articles for inserting ads and other inline content

    function _mapElementToDimensions(el) {
        var dim = bonzo(el).offset();
        return {
            top: dim.top,
            bottom: dim.top + dim.height,
            element: el
        };
    }

    // returns an array of spaces between elements (elems arg is an array of object literals with top/bottom coords)
    function _elemsToSpaces(elems, bottom) {
        elems = _(elems);
        // take the tops and bottoms of the non para elems and zip them to get
        // the tops/bottoms of the spaces
        var tops    = elems.pluck('top'),
            bottoms = elems.pluck('bottom');
        // add 0 and bodyBottom coords so we get the first and last spaces
        bottoms.splice(0,0,0);
        tops.push(bottom);

        // zip, filter out duds (from overlapping elements) and map to object literal
        return bottoms.zip(tops.valueOf())
            .filter(function(space) {
                return space[0] < space[1];
            })
            .map(function(space) {
                return {
                    top: space[0],
                    bottom: space[1],
                    height: space[1] - space[0]
                };
            }).valueOf();
    }

    // find all elems that lie in space and filter them to viable slots
    function _findViableParagraphs(elems, spaces, height, minTop, minTopPadding) {
        return _(elems)
            .map(function(para) {
                if (para.top > minTop) { // must be >minTop after top of body
                    var thisSpace = _(spaces).find(function(space) {
                        var enoughSpace = space.bottom - para.top >= height,
                            enoughPadding = para.top - space.top >= minTopPadding,
                            containedInSpace = space.top <= para.top && space.bottom >= para.bottom;
                        return enoughSpace && enoughPadding && containedInSpace;
                    }).valueOf();
                    if (thisSpace) {
                        return {element: para.element};
                    }
                }

            })
            .filter(function(slot) {
                return slot !== undefined;
            }).valueOf();
    }

    // getParaWithSpace returns a paragraph with:
    // - at least `height` space from its top until the next non-para element
    // - at least `minTop` from the beginning of the article
    // - at least `minTopPadding` below the previous non-para element
    function getParaWithSpace(height, minTop, minTopPadding) {
        minTop = minTop || 0;
        minTopPadding = minTopPadding || 0;

        // get all immediate children (and filter by para / non-para)
        var bodyBottom = $('.js-article__body')[0].offsetHeight,
            allElems = _(qwery('.js-article__body > *')).map(_mapElementToDimensions),
            nonParaElems = allElems.filter(function(el) {
                return el.element.tagName.toLowerCase() !== 'p';
            }),
            paraElems  = allElems.filter(function(el) {
                return el.element.tagName.toLowerCase() === 'p';
            });

        var spaces = _elemsToSpaces(nonParaElems, bodyBottom);
        var slots = _findViableParagraphs(paraElems, spaces, height, minTop, minTopPadding);
        return slots.length > 0 ? slots[0].element : undefined;
    }

    return {
        getParaWithSpace: getParaWithSpace,
        _elemsToSpaces: _elemsToSpaces, // exposed for unit testing
        _findViableParagraphs: _findViableParagraphs // exposed for unit testing
    };
});