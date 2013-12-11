define(function() {
    return function(url) {
        var a, path;
        if(typeof url !== 'string') { return; }
        a = document.createElement('a');
        a.href = url;
        path = a.pathname;
        return path.indexOf('/') === 0 ? path.substr(1) : path; // because IE doesn't return a leading '/'
    };
});
