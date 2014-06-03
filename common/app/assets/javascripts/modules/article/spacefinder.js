define(['bonzo','qwery', 'common/_', 'common/$'], function(bonzo, qwery, _, $) {
    // find spaces in articles for inserting ads and other inline content

    // getParaWithSpace returns a paragraph with:
    // - at least `height` space from its top until the next non-para element
    // - at least `minTop` from the beginning of the article
    // - at least `minTopPadding` below the previous non-para element
    function getParaWithSpace(height, minTop, minTopPadding) {
        minTopPadding = minTopPadding || 0;

        var mapElToDimensions = function(el) {
            return {
                top: el.offsetTop,
                bottom: el.offsetTop + el.offsetHeight,
                element: el
            };
        };

        // get all immediate children (and filter by para / non-para)
        var bodyTop = 0,
            bodyBottom = $('.js-article__body')[0].offsetHeight,
            allElems = _(qwery('.js-article__body > *')).map(mapElToDimensions),
            nonParaElems = allElems.filter(function(el) {
                return el.element.tagName.toLowerCase() !== 'p';
            }),
            paraElems  = allElems.filter(function(el) {
                return el.element.tagName.toLowerCase() === 'p';
            });

        // take the tops and bottoms of the non para elems and zip them to get
        // the tops/bottoms of the spaces
        var tops    = nonParaElems.pluck('top'),
            bottoms = nonParaElems.pluck('bottom');
        // add 0 and bodyBottom coords so we get the first and last spaces
        bottoms.splice(0,0,bodyTop);
        tops.push(bodyBottom);

        // zip, filter out duds (from overlapping elements) and map to object literal
        var spaces = bottoms.zip(tops.valueOf())
            .filter(function(space) {
                return space[0] < space[1];
            })
            .map(function(space) {
                return {
                    top: space[0],
                    bottom: space[1],
                    height: space[1] - space[0]
                };
            });

        // find all para elems that lie in a space and filter to viable slots
        var slots = paraElems
            .map(function(para) {
                if (para.top - bodyTop < minTop) {
                    return undefined; // para is too close to start of article
                }
                var thisSpace = spaces.find(function(space) {
                    return space.top < para.top && space.bottom > para.bottom;
                }).valueOf();
                return thisSpace ? {element: para.element, height: thisSpace.bottom - para.top, paddingTop: para.top - thisSpace.top} : undefined;
            })
            .filter(function(slot) {
                return slot !== undefined;
            });

        // find a big enough slot
        var bigEnoughSlot = slots.find(function(slot) {
            return slot.height > height && slot.paddingTop > minTopPadding;
        }).valueOf();

        return bigEnoughSlot ? bigEnoughSlot.element : undefined;
    }

    return { getParaWithSpace: getParaWithSpace };
});