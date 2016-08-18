@()

/* Source: https://github.com/remy/polyfills/blob/master/classList.js */
(function (Element) {

    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s);
                var ii = matches.length;
                var i = 0;
                while (i < ii && matches[i] !== this) {
                    i += 1;
                }
                return i < ii;
            };
    }

})(window.Element);
