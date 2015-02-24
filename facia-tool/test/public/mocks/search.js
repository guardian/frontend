define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    var latestArticles = {
        response: {
            status: 'ok',
            userTier: 'internal',
            total: 0,
            startIndex: 1,
            pageSize: 50,
            currentPage: 1,
            pages: 0,
            orderBy: 'newest',
            results: []
        }
    };
    var allArticles = {};
    var lastRequest;

    $.mockjax({
        url: /\/api\/proxy\/search\?(.+)/,
        urlParams: ['queryString'],
        response: function (req) {
            lastRequest = req;
            req.urlParams = parse(req.urlParams.queryString);
            if (!req.urlParams.ids) {
                this.responseText = latestArticles;
            } else {
                var response = allArticles[req.urlParams.ids];
                if (!response) {
                    response = {
                        status: 'fail'
                    };
                }
                this.responseText = response;
            }
        },
        onAfterComplete: function () {
            mediator.emit('mock:search', lastRequest);
        }
    });

    function parse (string) {
        var result = {};
        var params = string.split('&');
        for (var i = 0; i < params.length; i += 1) {
            var pair = params[i].split('=');
            result[pair[0]] = decodeURIComponent(pair[1]);
        }
        return result;
    }

    return {
        set: function (articles) {
            allArticles = _.extend(allArticles, articles);
        },
        latest: function (articles) {
            latestArticles.response.results = articles;
            latestArticles.response.total = articles.length;
            latestArticles.response.pages = Math.ceil(articles.length / latestArticles.response.pageSize);
        }
    };
});
