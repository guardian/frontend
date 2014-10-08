define(function() {
    // Returns the abspath of a url, without a leading slash (because ContentApi ids are formed like that)
    return function(url) {
        var a, path;
        if(typeof url !== 'string') { return; }
        a = document.createElement('a');
        a.href = url;
        path = a.pathname;
        return path.indexOf('/') === 0 ? path.substr(1) : path; // because IE already omits the leading slash
    };
});
