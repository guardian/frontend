define(function(prefix) {

    // Generate a collection id in this format:
    // <prefix, e.g. origin front>/<creation date as YYYYMMDD>-<4 digit hex>
    //
    // eg: "uk/culture/20140225-ba29"

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return function(prefix) {
        var n = new Date();
        var m = n.getMonth() + 1;
        var d = n.getDate();
        return (prefix ? prefix + '/' : '') +
            n.getFullYear() +
            (m < 10 ? "0" : '') + m +
            (d < 10 ? "0" : '') + d + '-' +  s4();
    };
});
