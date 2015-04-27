define([
    'common/utils/$',
    'qwery',
    'bonzo',
    'bean',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/identity/api'
], function (
    $,
    qwery,
    bonzo,
    bean,
    _,
    config,
    mediator,
    identity

) {
    function SavedForLater() {

        this.init = function () {
            var self = this;

            $('.js-saved-content').each(function (element) {
                bean.on(element, 'click', '.js-saved-content__button', function (event) {
                    event.preventDefault();
                    self.fetchArticlesAndRemove(element);
                });
            });
        };

        this.fetchArticlesAndRemove = function (element) {
            var self = this,
                data,
                notFound  = {message:'Not found', description:'Resource not found'},
                shortUrl = element.getAttribute('shortUrl');

            identity.getUsersSavedDocuments().then(
                function success(resp) {
                    if (resp.status === 'error') {
                        if (resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                            //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
                            var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');
                            data = {version: date, articles:[]};
                        }
                    } else {
                        data = resp.savedArticles;
                    }
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
    }

    return SavedForLater;
});
