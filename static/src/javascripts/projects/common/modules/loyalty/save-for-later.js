define([
    'qwery',
    'bonzo',
    'bean',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/views/svgs',
    'text!common/views/loyalty/save-for-later.html'
], function (
    qwery,
    bonzo,
    bean,
    _,
    config,
    mediator,
    template,
    identity,
    svgs,
    saveForLaterTmpl
) {
    function SaveForLater() {
        this.saveLinkHolder = qwery('.js-save-for-later')[0];
        this.userData = null;
        this.pageId = config.page.pageId;
        this.$saver = bonzo(this.saveLinkHolder);
        this.savedArticlesUrl = config.page.idUrl + '/saved-for-later';
        this.shortUrl = config.page.shortUrl.replace('http://gu.com', '');   //  Keep the fitst trailing slash
    }

    var bookmarkSvg = svgs('bookmark', ['i-left']);

    SaveForLater.prototype.init = function () {
        if (identity.isUserLoggedIn()) {
            this.getSavedArticles();
        } else {
            var url = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                '&shortUrl=' + this.shortUrl;
            this.$saver.html(
                template(saveForLaterTmpl, {
                    url: url,
                    icon: bookmarkSvg,
                    state: 'save'
                })
            );
        }
    };

    SaveForLater.prototype.getSavedArticles = function () {
        var self = this,
            notFound  = {message:'Not found', description:'Resource not found'};
        identity.getSavedArticles().then(
            function success(resp) {
                if (resp.status === 'error') {
                    if (resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
                        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');
                        self.userData = {version: date, articles:[]};
                    }
                } else {
                    self.userData = resp.savedArticles;
                }

                if (self.hasUserSavedArticle(self.userData.articles, self.shortUrl)) {
                    self.$saver.html('<a href="' + self.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
                } else {
                    self.$saver.html('<a class="meta__save-for-later--link" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>');
                    bean.on(self.saveLinkHolder, 'click', '.meta__save-for-later--link', self.saveArticle.bind(self));
                }
            }
        );
    };

    SaveForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.prototype.saveArticle = function () {
        var self = this,
            //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: self.pageId, shortUrl: self.shortUrl, date: date, read: false  };

        self.userData.articles.push(newArticle);

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                    self.$saver.html('<a href="' + self.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Error saving</a>');
                } else {
                    bean.off(qwery('.meta__save-for-later--link', self.saveLinkHolder)[0], 'click', self.saveArticle);
                    self.$saver.html('<a href="' + self.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
                }
            }
        );
    };

    return SaveForLater;
});
