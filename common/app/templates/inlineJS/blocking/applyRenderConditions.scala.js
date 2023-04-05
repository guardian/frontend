@()(implicit request: RequestHeader)
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
        This is a shortened version of shouldHideSupportMessaging() from
        user-features.js. Since we are blocking rendering at this time we
        can't inline all required JS from this module.
    */
    function isRecentContributor() {
        var value = getCookieValue('gu.contributions.contrib-timestamp');

        if (!value) {
            return false;
        }

        var now = new window.Date().getTime();
        var lastContribution = new window.Date(value).getTime();
        var diffDays = Math.ceil((now - lastContribution) / (1000 * 3600 * 24));

        return diffDays <= 180;
    }


    function shouldHideSupportMessaging() {
        return getCookieValue('gu_hide_support_messaging') === 'true';
    }

    function forcePercentagePadding() {
        var firefoxMatch = navigator.userAgent.match(/Firefox\/([0-9]+)\./) || [];

        if (firefoxMatch.length === 2 && parseInt(firefoxMatch[1], 10) < 54) {
            return true;
        }

        return false;
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

    if (shouldHideSupportMessaging()) {
        docClass += ' hide-support-messaging';
    }

    if (isRecentContributor()) {
        docClass += ' is-recent-contributor';
    }

    // % used for padding-bottom isn't supported on Grid items in FireFox <53
    // unless explicit width is set on the element with padding-bottom.
    // .force-percentage-padding ensures width is explicitly set so padding-bottom
    // works on responsive-ratio media.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=958714
    if(forcePercentagePadding()) {
        docClass += ' force-percentage-padding';
    }

    documentElement.className = docClass.replace(/\bjs-off\b/g, 'js-on');
})(document.documentElement, window, navigator);
