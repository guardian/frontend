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

        document.cookie = name + "=" + value + "; path=/; expires=" + expires.toUTCString() + ";";
    }

    function get(name) {
        var nameEq = name + '=',
            cookieVals = document.cookie.split(';'),
            val;

        for (var i = 0; i < cookieVals.length; i++) {
            val = cookieVals[i];
            while (val.charAt(0) === ' ') { val = val.substring(1, val.length); }
            if (val.indexOf(nameEq) === 0) { return val.substring(nameEq.length, val.length); }
        }
        return null;
    }

    return {
        cleanUp: cleanUp,
        add: add,
        get: get
    };

});
