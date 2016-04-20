@()
@import conf.switches.Switches._

/**
 * Choose how the browser should render the page before any painting begins.
 */
(function (documentElement, window, navigator) {
    var docClass = documentElement.className;

    function cssToDOM(name) {
        return name.replace(/([a-z])-([a-z])/g, function (str, m1, m2) {
            return m1 + m2.toUpperCase();
        }).replace(/^-/, '');
    }

    function testCssSuportForProperty(prop) { return testCssSupportForPropertyAndValue(prop, undefined); }

    function testCssSupportForPropertyAndValue(prop, value) {
        var valueIsDefined = value !== undefined;
        if (valueIsDefined && ('CSS' in window && 'supports' in window.CSS)) {
            return window.CSS.supports(prop, value);
        } else {
            try {
                var elm = document.createElement('test');
                prop = cssToDOM(prop);
                if (elm.style[prop] !== undefined) {

                    if (valueIsDefined) {
                        var before = elm.style[prop];
                        try {
                            elm.style[prop] = value;
                        } catch (e) {}
                        if (elm.style[prop] !== before) {
                            elm = null;
                            return true;
                        } else {
                            elm = null;
                            return false;
                        }
                    }
                    elm = null;
                    return true;
                }
            } catch (e) {
                return false;
            }
        }
    }

    // http://modernizr.com/download/#-svg
    if (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
        docClass += ' svg';
    } else {
        docClass += ' no-svg';
    }

    if (testCssSuportForProperty('flex') || testCssSuportForProperty('-ms-flex') || testCssSuportForProperty('-webkit-flex') || testCssSuportForProperty('-moz-box-flex') || testCssSuportForProperty('-webkit-box-flex')) {
        docClass += ' has-flex';
    } else {
        docClass += ' has-no-flex';
    }

    if (testCssSuportForProperty('flex-wrap') || testCssSuportForProperty('-ms-flex-wrap') || testCssSuportForProperty('-webkit-flex-wrap')) {
        docClass += ' has-flex-wrap';
    } else {
        docClass += ' has-no-flex-wrap';
    }

    if (testCssSupportForPropertyAndValue('position', 'fixed')) {
        docClass += ' has-fixed';
    }

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
    documentElement.className = docClass.replace(/\bjs-off\b/g, 'js-on');
})(document.documentElement, window, navigator);
