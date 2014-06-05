define(['bonzo','qwery', 'common/_'], function(bonzo, qwery, _) {
    // find spaces in articles for inserting ads and other inline content

    var bodySelector = '.js-article__body';

    function _mapElementToDimensions(el) {
        return {
            top: el.offsetTop,
            bottom: el.offsetTop + el.offsetHeight,
            element: el
        };
    }

    // minAbove and minBelow are measured from the top of the paragraph element being tested
    var defaultRules = { // these are written for adverts
        minAbove: 250,
        minBelow: 300,
        selectors: {
            ' > h2': {minAbove: 0, minBelow: 250}, // hug h2s
            ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250} // require spacing for all other elements
        }
    };

    // test one element vs another for the given rules
    var _testElem = function(para, other, rules) {
        var isMinAbove = para.top - other.bottom >= rules.minAbove,
            isMinBelow = other.top - para.bottom >= rules.minBelow;
        return isMinAbove || isMinBelow;
    };

    // test one element vs an array of other elements for the given rules
    var _testElems = function(para, others, rules) {
        return _(others).every(function(other) {
            return _testElem(para, other, rules);
        }).valueOf();
    };

    function _enforceRules(slots, rules, bodyHeight) {
        var filtered = _(slots).filter(function(p) {
            return p.top >= rules.minAbove && p.top + rules.minBelow <= bodyHeight;
        });
        _(rules.selectors).forOwn(function(params, selector){
            var relevantElems = _(qwery(bodySelector + selector)).map(_mapElementToDimensions);

            filtered = filtered.filter(function(slot) {
                return _testElems(slot, relevantElems, params);
            });
        });
        return filtered.valueOf();
    }

    // getParaWithSpace returns a paragraph that satisfies the given/default rules:
    function getParaWithSpace(rules) {
        rules = rules || defaultRules;

        // get all immediate children
        var bodyBottom = qwery(bodySelector)[0].offsetHeight,
            allElems = _(qwery(bodySelector + ' > *')).map(_mapElementToDimensions),
            paraElems  = allElems.filter(function(el) {
                return el.element.tagName.toLowerCase() === 'p';
            });

        var slots = _enforceRules(paraElems, rules, bodyBottom);
        return slots.length ? slots[0].element : undefined;
    }

    return {
        getParaWithSpace: getParaWithSpace,
        _testElem: _testElem, // exposed for unit testing
        _testElems: _testElems // exposed for unit testing
    };
});
