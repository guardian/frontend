define(function() {
    return function(url) {
        var a;
        if(typeof url !== 'string') { return; }
        a = document.createElement('a');
        a.href = url;
        return a.hostname;
    };
});
