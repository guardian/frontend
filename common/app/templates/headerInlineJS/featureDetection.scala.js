@()
@import conf.switches.Switches._

(function (documentElement, window, navigator) {
    // feature detection
    var docClass = documentElement.className;

    function cssToDOM(name) {
        return name.replace(/([a-z])-([a-z])/g, function (str, m1, m2) {
            return m1 + m2.toUpperCase();
        }).replace(/^-/, '');
    }

    function testCssSupport(prop, value) {
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

    if (testCssSupport('flex') || testCssSupport('-ms-flex') || testCssSupport('-webkit-flex') || testCssSupport('-moz-box-flex') || testCssSupport('-webkit-box-flex')) {
        docClass += ' has-flex';
    } else {
        docClass += ' has-no-flex';
    }

    if (testCssSupport('flex-wrap') || testCssSupport('-ms-flex-wrap') || testCssSupport('-webkit-flex-wrap')) {
        docClass += ' has-flex-wrap';
    } else {
        docClass += ' has-no-flex-wrap';
    }

    if (testCssSupport('position', 'fixed')) {
        docClass += ' has-fixed';
    }

    if (window.guardian.isModernBrowser) {
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
