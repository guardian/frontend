define(function() {
    return function(url) {
        var a, path;
        if(typeof url !== 'string') { return; }

        // If necessary, add a leading slash to stop the browser resolving it against the current path
        url = url.match(/^\//) || url.match(/^https?:\/\//)? url : '/' + url;

        a = document.createElement('a');
        a.href = url;
        path = a.pathname;

        // Return the abspath without a leading slash (because ContentApi ids are formed like that)
        return path.indexOf('/') === 0 ? path.substr(1) : path;
    };
});
