define(function () {

    function cleanUp(list) {
        for (var i = 0, j = list.length; i<j; ++i) {
            document.cookie = list[i] + "=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
    }

    function add(name, value) {
        var expires = new Date();
        expires.setMonth(expires.getMonth() + 5);
        expires.setDate(1);
        document.cookie = name + "=" + value + "; path=/; expires=" + expires.toUTCString() + ";";
    }

    return {
        cleanUp: cleanUp,
        add: add
    };

});
