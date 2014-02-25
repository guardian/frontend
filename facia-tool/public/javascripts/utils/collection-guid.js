define(function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return function() {
        var n = new Date();
        var m = n.getMonth() + 1;
        var d = n.getDate();
        return '' + n.getFullYear() + (m < 10 ? "0" : '') + m + (d < 10 ? "0" : '') + d + '-' +  s4();
    };
});
