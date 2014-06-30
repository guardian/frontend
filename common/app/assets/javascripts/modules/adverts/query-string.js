define([], function () {

    function generateQueryString(queryParams) {
        var query = '';

        for (var param in queryParams) {
            if (queryParams.hasOwnProperty(param)) {
                if (query !== '') {
                    query += '&';
                }
                var targetValue = queryParams[param];
                if (typeof targetValue === 'string') {
                    query += param + '=' + targetValue;
                } else if(typeof targetValue === 'object') {
                    query += param + '=' + targetValue.join(',');
                }
            }
        }

        return query;
    }

    function formatKeyword(keyword) {
        return keyword.replace(/[+\s]+/g, '-').toLowerCase();
    }

    function getKeywords(config) {
        return config.keywords.split(',').map(function(keyword){
            return 'k=' + encodeURIComponent(formatKeyword(keyword));
        }).join('&');
    }

    return {
        generateQueryString: generateQueryString,
        getKeywords: getKeywords,
        formatKeyword: formatKeyword
    };

});
