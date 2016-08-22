@()

/* Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches */
(function (ElementPrototype) {

    if (!ElementPrototype.matches) {
        ElementPrototype.matches =
            ElementPrototype.matchesSelector ||
            ElementPrototype.mozMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            ElementPrototype.oMatchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
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

})(window.Element.prototype);
