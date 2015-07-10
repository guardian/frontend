(function (doc, win) {
    // http://modernizr.com/download/#-svg
    if (!!doc.createElementNS && !!doc.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
        win.docClass += ' svg';
    } else {
        win.docClass += ' no-svg';
    }

    if (win.guardian.isModernBrowser) {
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
                var elm = doc.createElement('test');
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
            win.docClass += ' has-flex';
        } else {
            win.docClass += ' has-no-flex';
        }

        if (testCssSupport('flex-wrap') || testCssSupport('-ms-flex-wrap') || testCssSupport('-webkit-flex-wrap')) {
            win.docClass += ' has-flex-wrap';
        } else {
            win.docClass += ' has-no-flex-wrap';
        }

        if (testCssSupport('position', 'fixed')) {
            win.docClass += ' has-fixed';
        }

        win.docClass = win.docClass.replace(/\bis-not-modern\b/g, 'is-modern');
    }
})(document, window);
