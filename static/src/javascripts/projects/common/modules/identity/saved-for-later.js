define([
    'common/utils/$',
    'qwery',
    'bonzo',
    'bean',
    'common/utils/_',
    'common/modules/identity/api'
], function (
    $,
    qwery,
    bonzo,
    bean,
    _,
    identity

) {
    function SavedForLater() {

        this.init = function () {
            var self = this,
            form = $('.js-saved-content-form')[0];
            if(form) {
                bean.on(form, 'click', '.js-saved-content__button-delete-all', function (event) {
                    event.preventDefault();
                    self.fetchArticlesAndRemoveAll();
                });
            }

            this.savedArticles = $('.js-saved-content');
            this.savedArticles.each(function (element) {
                bean.on(element, 'click', '.js-saved-content__button', function (event) {
                    event.preventDefault();
                    self.fetchArticlesAndRemove(element);
                });
            });
        };

        this.fetchArticlesAndRemoveAll = function () {
            var self = this,
                data;

            identity.getSavedArticles().then(
                function success(resp) {
                    data = self.getArticleDataFromResponse(resp);
                    self.deleteAllArticles(data.version);
                }
            );
        };

        this.fetchArticlesAndRemove = function (element) {
            var self = this,
                data,
                shortUrl = element.getAttribute('shortUrl');

            identity.getSavedArticles().then(
                function success(resp) {
                    data = self.getArticleDataFromResponse(resp);
                    self.deleteArticle(data, shortUrl, element);
                }
            );
        };

        this.deleteArticle = function (data, shortUrl, element) {
            data.articles = _.filter(data.articles, function (article) {
                return article.shortUrl !== shortUrl;
            });

            identity.saveToArticles(data).then(
                function success(resp) {
                    if (resp.status !== 'error') {
                        element.remove();
                    }
                }
            );
        };

        this.deleteAllArticles = function (version) {

            var self = this;

            identity.saveToArticles({version: version, articles:[]}).then(
                function success(resp) {
                    if (resp.status !== 'error') {
                        self.savedArticles.each(function (element) {
                            element.remove();
                        });
                    }
                }
            );
        };

        this.getArticleDataFromResponse = function (resp) {

            var notFound  = {message:'Not found', description:'Resource not found'},
                date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');

            if (resp.status === 'error') {
                if (resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                    return {version: date, articles:[]};
                }
            } else {
                return resp.savedArticles;
            }
        };
    }

    return SavedForLater;
});
