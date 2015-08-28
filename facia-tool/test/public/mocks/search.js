import Mock from 'mock/generic-mock';

function parse (string) {
    var result = {};
    var params = string.split('&');
    for (var i = 0; i < params.length; i += 1) {
        var pair = params[i].split('=');
        result[pair[0]] = decodeURIComponent(pair[1]);
    }
    return result;
}

class Search extends Mock {
    constructor() {
        super(/\/api\/live\/search\?(.+)/, ['queryString']);

        this.latestArticles = {
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
    }

    handle(req, data, xhr) {
        req.urlParams = parse(req.urlParams.queryString);
        if (!req.urlParams.ids) {
            return this.latestArticles;
        } else {
            var response = data[req.urlParams.ids];
            if (!response) {
                xhr.status = 500;
                xhr.statusText = 'FAIL';
                response = {
                    status: 'fail'
                };
            }
            return response;
        }
    }

    latest(articles) {
        this.latestArticles.response.results = articles;
        this.latestArticles.response.total = articles.length;
        this.latestArticles.response.pages = Math.ceil(articles.length / this.latestArticles.response.pageSize);
    }
}

export default Search;
