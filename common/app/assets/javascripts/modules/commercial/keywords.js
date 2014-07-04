define(function () {

    function format(keyword) {
        return keyword.replace(/[+\s]+/g, '-').toLowerCase();
    }

    function get(config) {
        return config.keywords.split(',').map(function(keyword){
            return 'k=' + encodeURIComponent(format(keyword));
        }).join('&');
    }

    return {
        get: get,
        format: format
    };

});
