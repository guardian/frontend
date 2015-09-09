import * as contentApi from 'modules/content-api';
import * as mockjax from 'test/utils/mockjax';
import parse from 'utils/parse-query-params';

describe('Latest articles', function() {
    beforeEach(function () {
        this.scope = mockjax.scope();
    });
    afterEach(function () {
        this.scope.clear();
    });

    it('whole list should filter out articles', function (done) {
        this.scope({
            url: /\/api\/preview\/content\/scheduled(\?.+)/,
            urlParams: ['queryString'],
            response: function (request) {
                var urlParams = parse(request.urlParams.queryString);
                expect(urlParams.page).toBe('1');
                expect(urlParams['order-by']).toBe('oldest');
                expect(urlParams['page-size']).toBe('50');
                expect(urlParams.q).toBeUndefined();

                this.responseText = {
                    response: {
                        status: 'ok',
                        results: [{
                            fields: {
                                headline: 'This has an header'
                            }
                        }, {
                            not: 'This doesn\'t, filter out'
                        }]
                    }
                };
            }
        });

        contentApi.fetchLatest()
        .then(list => {
            expect(list.results).toEqual([{
                fields: {
                    headline: 'This has an header'
                }
            }]);
        })
        .then(done)
        .catch(done.fail);
    });

    it('filter out based on a search term', function (done) {
        this.scope({
            url: /\/api\/live\/search(\?.+)/,
            urlParams: ['queryString'],
            response: function (request) {
                var urlParams = parse(request.urlParams.queryString);
                expect(urlParams.page).toBe('1');
                expect(urlParams['order-by']).toBe('newest');
                expect(urlParams['page-size']).toBe('50');
                expect(urlParams.q).toBe('one');
                expect(urlParams.author).toBe('me');

                this.responseText = {
                    response: {
                        status: 'ok',
                        results: [{
                            fields: {
                                headline: 'Filtering results'
                            }
                        }]
                    }
                };
            }
        });

        contentApi.fetchLatest({
            isDraft: false,
            term: 'one',
            filterType: 'author',
            filter: 'me'
        })
        .then(list => {
            expect(list.results).toEqual([{
                fields: {
                    headline: 'Filtering results'
                }
            }]);
        })
        .then(done)
        .catch(done.fail);
    });

    it('all results empty response', function (done) {
        this.scope({
            url: /\/api\/preview\/content\/scheduled(\?.+)/,
            responseText: {
                response: {
                    status: 'ok',
                    results: []
                }
            }
        });

        contentApi.fetchLatest()
        .then(done.fail, error => {
            expect(error instanceof Error).toBe(true);
            expect(error.message).toMatch(/not currently returning content/i);

            done();
        });
    });

    it('searches an article', function (done) {
        this.scope({
            url: /\/api\/preview\/uk-news\/important\/stuff\?(.+)/,
            responseText: {
                status: 'ok',
                response: {
                    content: [{
                        fields: {
                            headline: 'Single article'
                        }
                    }]
                }
            }
        });

        contentApi.fetchLatest({
            article: 'uk-news/important/stuff'
        })
        .then(list => {
            expect(list.results).toEqual([{
                fields: {
                    headline: 'Single article'
                }
            }]);
        })
        .then(done)
        .catch(done.fail);
    });

    it('network fail', function (done) {
        this.scope({
            url: /\/api\/preview\/uk-news\/less\/important.*/,
            responseText: 'Server error',
            status: 500
        });

        contentApi.fetchLatest({
            article: 'uk-news/less/important',
            term: 'ignored'
        })
        .then(done.fail, error => {
            expect(error instanceof Error).toBe(true);
            expect(error.message).toMatch(/Content API error/i);

            done();
        });
    });
});
