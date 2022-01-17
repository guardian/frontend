/*eslint-disable */
/*
*  Loads the Launchpad js tracker (used by Redplanet) into the page,
*  and creates the global "launchpad" method
*  TODO put this file in __vendors
*/
;(function (p, l, o, w, i, n, g) {
    if (!p[i]) {
        p.GlobalSnowplowNamespace = p.GlobalSnowplowNamespace || [];
        p.GlobalSnowplowNamespace.push(i);
        p[i] = function () {
            (p[i].q = p[i].q || []).push(arguments)
        };
        p[i].q = p[i].q || [];
        n = l.createElement(o);
        g = l.getElementsByTagName(o)[0];

        n.async = 1;
        n.src = w;

        g.parentNode.insertBefore(n, g)
    }
}(window, document, "script", "https://lps.qantas.com/sp.js", "launchpad"));
