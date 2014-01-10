define(function () {

    function cleanUp(list) {
        for (var i = 0, j = list.length; i<j; ++i) {
            document.cookie = list[i] + "=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
    }

    function add(name, value, daysToLive) {

        var expires = new Date();

        if (daysToLive) {
            expires.setDate(expires.getDate() + daysToLive);
        } else {
            expires.setMonth(expires.getMonth() + 5);
            expires.setDate(1);
        }

        // remove www (and dev bit, for localhost set up with dev.theguardian.com domain)
        var domain = document.domain.replace(/^(www|dev)\./, '.');

        document.cookie = name + "=" + value + "; path=/; expires=" + expires.toUTCString() + "; domain=" + domain + ";";
    }

    function get(name) {
        var cookieVal,
            nameEq = name + '=',
            cookies = document.cookie.split(';');

        cookies.forEach(function(cookie) {
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEq) === 0) {
                cookieVal = cookie.substring(nameEq.length, cookie.length);
                return cookieVal;
            }
        });

        return cookieVal;
    }

    return {
        cleanUp: cleanUp,
        add: add,
        get: get
    };

});
