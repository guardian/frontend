@()

(function (window, document) {

    function getCookieValue(name) {
        var nameEq = name + "=",
            cookies = document.cookie.split(';'),
            value = null;
        cookies.forEach(function (cookie) {
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEq) === 0) {
                value = cookie.substring(nameEq.length, cookie.length);
            }
        });
        return value;
    }

    window.guardian.config.ophan = {

        // This is duplicated from
        // https://github.com/guardian/ophan/blob/master/tracker-js/assets/coffee/ophan/transmit.coffee
        // Please do not change this without talking to the Ophan project first.
        pageViewId: new Date().getTime().toString(36) + 'xxxxxxxxxxxx'.replace(/x/g, function () {
            return Math.floor(Math.random() * 36).toString(36);
        }),

        browserId: getCookieValue("bwid")

    };

})(window, document);




