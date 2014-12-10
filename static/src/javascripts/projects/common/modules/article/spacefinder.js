/* jscs:disable disallowDanglingUnderscores */
define([
    'qwery',
    'bonzo',
    'common/utils/_'
], function (
    qwery,
    bonzo,
    _
) {

    // find spaces in articles for inserting ads and other inline content

    var bodySelector = '.js-article__body',
        // minAbove and minBelow are measured in px from the top of the paragraph element being tested
        defaultRules = { // these are written for adverts
            minAbove: 250, // minimum from para to top of article
            minBelow: 300, // minimum from (top of) para to bottom of article
            selectors: { // custom rules using selectors. format:
                //'.selector': {
                //   minAbove: <min px above para to bottom of els matching selector>,
                //   minBelow: <min px below (top of) para to top of els matching selector> }
                ' > h2': {minAbove: 0, minBelow: 250}, // hug h2s
                ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250} // require spacing for all other elements
            }
        },
        // test one element vs another for the given rules
        _testElem = function (para, other, rules) {
            var isMinAbove = para.top - other.bottom >= rules.minAbove,
                isMinBelow = other.top - para.top >= rules.minBelow;
            return isMinAbove || isMinBelow;
        },
        // test one element vs an array of other elements for the given rules
        _testElems = function (para, others, rules) {
            return _(others).every(function (other) {
                return _testElem(para, other, rules);
            }).valueOf();
        };

    function _mapElementToDimensions(el) {
        return {
            top: el.offsetTop,
            bottom: el.offsetTop + el.offsetHeight,
            element: el
        };
    }

    function _debugErrPara(p, message) {
        bonzo(p)
            .addClass('spacefinder--error')
            .attr('data-spacefinder-msg', message);
    }

    function _enforceRules(slots, rules, bodyHeight, debug) {
        var filtered = _(slots).filter(function (p) {
            var farEnoughFromTopOfBody = p.top >= rules.minAbove,
                farEnoughFromBottomOfBody = p.top + rules.minBelow <= bodyHeight,
                valid = farEnoughFromTopOfBody && farEnoughFromBottomOfBody;

            if (debug && !valid) {
                if (!farEnoughFromTopOfBody) { _debugErrPara(p.element, 'too close to top of body'); }
                if (!farEnoughFromBottomOfBody) { _debugErrPara(p.element, 'too close to bottom of body'); }
            }

            return valid;
        });
        _(rules.selectors).forOwn(function (params, selector) {
            var relevantElems = _(qwery(bodySelector + selector)).map(_mapElementToDimensions);

            filtered = filtered.filter(function (p) {
                var valid = _testElems(p, relevantElems, params);
                if (debug && !valid) {
                    _debugErrPara(p.element, 'too close to selector (' + selector + ')');
                }
                return valid;
            });
        });
        return filtered.valueOf();
    }

    // getParaWithSpace returns a paragraph that satisfies the given/default rules:
    function getParaWithSpace(rules, debug) {
        var bodyBottom, paraElems, slots;
        rules = rules || defaultRules;

        // get all immediate children
        bodyBottom = qwery(bodySelector)[0].offsetHeight;
        paraElems = _(qwery(bodySelector + ' > p')).map(_mapElementToDimensions);

        if (debug) { // reset any previous debug messages
            bonzo(paraElems.pluck('element').valueOf())
                .attr('data-spacefinder-msg', '')
                .removeClass('spacefinder--valid')
                .removeClass('spacefinder--error');
        }

        slots = _enforceRules(paraElems, rules, bodyBottom, debug);

        if (debug) {
            bonzo(_.pluck(slots, 'element')).addClass('spacefinder--valid');
        }

        return slots.length ? slots[0].element : undefined;
    }

    return {
        getParaWithSpace: getParaWithSpace,
        _testElem: _testElem, // exposed for unit testing
        _testElems: _testElems // exposed for unit testing
    };
});
