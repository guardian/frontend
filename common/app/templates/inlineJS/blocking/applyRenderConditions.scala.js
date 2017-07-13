@()
@import conf.switches.Switches._

/**
 * Choose how the browser should render the page before any painting begins.
 */
(function (documentElement, window, navigator) {
    var docClass = documentElement.className;
    var testCssSupportForPropertyAndValue = (function(supportsSupports) {
        return supportsSupports ? nativeCSSSupports : shimCSSSupports();
    }('CSS' in window && 'supports' in window.CSS));

    function nativeCSSSupports(prop, value) {
        return window.CSS.supports(prop, value);
    }

    function shimCSSSupports() {
        var cssToDOMRegExp = /([a-z])-([a-z])/g;
        var testElem = document.createElement('test');

        function cssToDOM(name) {
            return name.replace(cssToDOMRegExp, cssToDOMReplacer).replace(/^-/, '');
        }

        function cssToDOMReplacer(str, m1, m2) {
            return m1 + m2.toUpperCase();
        }

        return function(prop, value) {
            try {
                prop = cssToDOM(prop);
                var originalValue = testElem.style[prop];

                if (originalValue === undefined) {
                    return false;
                }

                if (originalValue === value) {
                    return true;
                }

                testElem.style[prop] = value;
                return testElem.style[prop] !== originalValue;
            } catch (e) {
                return false;
            }
        }
    }

    /* testAndAddClass :: [(String, [String], [String])]
       Each tuple is a CSS feature detection where the first element is the name
       of the feature, the second is an array of property names, the third is an
       array of property values. If one combination is supported, the feature name
       is added as a class to the document element with a 'has-' prefix, 'has-no-'
       otherwise.
    */
    function testAndAddClass(tests) {
        docClass += ' ' + tests.map(function (test) {
            return (test.props.some(function(prop) {
                return test.values.some(function(value) {
                    return testCssSupportForPropertyAndValue(prop, value);
                });
            }) ? 'has-' : 'has-no-') + test.feature;
        }).join(' ');
    }

    function getCookieValue(name) {
        var val = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return val ? val.pop() : undefined;
    }

    /*
        This is a shortened version of shouldSeeReaderRevenue() from
        user-features.js. Since we are blocking rendering at this time we
        can't/ don't want to online all required JS from this module.
    */
    function isRecentContributor() {
        var value = getCookieValue('gu.contributions.contrib-timestamp');

        if (!value) {
            return false;
        }

        var now = new Date().getTime();
        var lastContribution = new Date(value).getTime();
        var diffDays = Math.ceil((now - lastContribution) / (1000 * 3600 * 24));

        return diffDays <= 180;
    }

    function isPayingMember() {
        return getCookieValue('gu_paying_member') === 'true';
    }

    // http://modernizr.com/download/#-svg
    if (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
        docClass += ' svg';
    } else {
        docClass += ' no-svg';
    }

    testAndAddClass([
        { feature: 'flex', props: ['flex', '-ms-flex', '-webkit-flex', '-moz-box-flex', '-webkit-box-flex'], values: ['inherit'] },
        { feature: 'flex-wrap', props: ['flex-wrap', '-ms-flex-wrap', '-webkit-flex-wrap'], values: ['inherit'] },
        { feature: 'fixed', props: ['position'], values: ['fixed'] },
        { feature: 'sticky', props: ['position'], values: ['sticky', '-webkit-sticky'] }
    ]);

    if (window.guardian.isEnhanced) {
        docClass = docClass.replace(/\bis-not-modern\b/g, 'is-modern');
    }

    @if(FontKerningSwitch.isSwitchedOn) {
        if (window.location.hash !== '#no-kern') {docClass += ' should-kern'}
    } else {
        if (window.location.hash === '#kern') {docClass += ' should-kern'}
    }

    // MINIMISE DOM THRASHING…

    // READs
    // rems are calculated in the CSS assuming a 16px baseline. if the user has changed theirs, account for it.
    var baseFontSize = null;
    if ('getComputedStyle' in window) {
        baseFontSize = window.getComputedStyle(documentElement).getPropertyValue("font-size")
    }

    // WRITEs
    if (baseFontSize && parseInt(baseFontSize, 10) !== 16) {
        documentElement.style.fontSize = baseFontSize
    }

    if (isPayingMember()) {
        docClass += ' is-paying-member';
    }

    if (isRecentContributor()) {
        docClass += ' is-recent-contributor';
    }

    documentElement.className = docClass.replace(/\bjs-off\b/g, 'js-on');
})(document.documentElement, window, navigator);
