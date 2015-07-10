// http://modernizr.com/download/#-svg
if (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
    docClass += ' svg';
} else {
    docClass += ' no-svg';
}

if (window.guardian.isModernBrowser) {
    function cssToDOM( name ) {
        return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
            return m1 + m2.toUpperCase();
        }).replace(/^-/, '');
    }

    function testCssSupport(prop, value) {
        var valueIsDefined = value !== undefined;
        if(valueIsDefined && ('CSS' in window && 'supports' in window.CSS)) {
            return window.CSS.supports(prop, value);
        } else {
            var elm = document.createElement('test');
            prop = cssToDOM(prop);
            if(elm.style[prop] !== undefined) {
                if(valueIsDefined){
                    var before = elm.style[prop];
                    try { elm.style[prop] = value; } catch (e) {}
                    if(elm.style[prop] != before) {
                        delete elm;
                        return true;
                    } else {
                        delete elm;
                        return false;
                    }
                }
                delete elm;
                return true;
            }
            return false;
        }
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

    docClass = docClass.replace(/\bis-not-modern\b/g, 'is-modern');
}
