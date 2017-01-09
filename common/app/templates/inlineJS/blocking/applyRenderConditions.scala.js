@()
@import conf.switches.Switches._

/**
 * Choose how the browser should render the page before any painting begins.
 */
(function (documentElement, window, navigator) {
    var docClass = documentElement.className;
    var supportsSupports = 'CSS' in window && 'supports' in window.CSS;
    var testCssSupportForPropertyAndValue = supportsSupports ?
        nativeTestCssSupportForPropertyAndValue :
        shimTestCssSupportForPropertyAndValue;

    function cssToDOM(name) {
        return name.replace(/([a-z])-([a-z])/g, function (str, m1, m2) {
            return m1 + m2.toUpperCase();
        }).replace(/^-/, '');
    }

    /* testAndAddClass :: Array[(String, Any -> Boolean, ...args)]
       Each tuple has a feature detect function that returns a boolean, to which
       we pass args. The first element of the tuple is the name of the feature.
       If the test passes, the name of the feature will be added to the class attribute
       of the HTML element with a prefix 'has-', and 'has-no-' otherwise.
    */
    function testAndAddClass(tests) {
        docClass += ' ' + tests.map(function (test) {
            var testClass = test[0];
            var testFn = test[1];
            var testArgs = Array.prototype.slice.call(test, 2);
            if (testFn.apply(undefined, testArgs)) {
                return 'has-' + testClass;
            } else {
                return 'has-no-' + testClass;
            }
        }).join(' ');
    }

    function testCssSupportForProperty(props) {
        return props.some(function (prop) {
            return shimTestCssSupportForPropertyAndValue(prop, undefined);
        });
    }

    function nativeTestCssSupportForPropertyAndValue(prop, values) {
        return values.some(function (value) {
            return window.CSS.supports(prop, value);
        });
    }

    function shimTestCssSupportForPropertyAndValue(prop, values) {
        var valueIsDefined = values !== undefined;
        try {
            var elm = document.createElement('test');
            prop = cssToDOM(prop);
            if (elm.style[prop] !== undefined) {

                if (valueIsDefined) {
                    var before = elm.style[prop];
                    var support = values.some(function (value) {
                        try {
                            elm.style[prop] = value;
                        } catch (e) {}
                        if (elm.style[prop] !== before) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    elm = null;
                    return support;
                }
                elm = null;
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    // http://modernizr.com/download/#-svg
    if (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
        docClass += ' svg';
    } else {
        docClass += ' no-svg';
    }

    testAndAddClass([
        ['flex', testCssSupportForProperty, ['flex', '-ms-flex', '-webkit-flex', '-moz-box-flex', '-webkit-box-flex']],
        ['flex-wrap', testCssSupportForProperty, ['flex-wrap', '-ms-flex-wrap', '-webkit-flex-wrap']],
        ['fixed', testCssSupportForPropertyAndValue, 'position', ['fixed']],
        ['sticky', testCssSupportForPropertyAndValue, 'position', ['sticky', '-webkit-sticky']]
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
    documentElement.className = docClass.replace(/\bjs-off\b/g, 'js-on');
})(document.documentElement, window, navigator);
