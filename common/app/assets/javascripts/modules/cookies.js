define(function () {

    function cleanUp(list) {
        for (var i = 0, j = list.length; i<j; ++i) {
            document.cookie = list[i] + "=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
    }

    return {
        cleanUp: cleanUp
    };

});
