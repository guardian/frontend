define([
       'qwery',
       'bonzo',
       'bean',
       'common/utils/_',
       'common/utils/config',
       'common/utils/mediator',
       'common/modules/identity/api'

], function (
        qwery,
        bonzo,
        bean,
        _,
        config,
        mediator,
        identity
    ){

    function SaveForLater() {
        this.saveLinkHolder = qwery('.meta__save-for-later')[0];
        this.userData = null;
        this.encodedPageUrl = encodeURIComponent(document.location.href);
        this.$saver = bonzo(this.saveLinkHolder);
        this.savedArticlesUrl = config.page.idUrl + '/saved-articles';
    }

    SaveForLater.prototype.init = function() {
        if(identity.isUserLoggedIn()) {
            this.getSavedArticles();
        }  else {
            var url = config.page.idUrl + '/prefs/save-content?returnUrl='+this.encodedPageUrl+'&shortUrl='+config.page.shortUrl;
            this.$saver.html(
                '<a href="' + url + ' "data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>'
            );
        }
    };

    SaveForLater.prototype.getSavedArticles = function() {
        var notFound  = [{message:'Not found',description:'Resource not found'}];
        var self = this;

        identity.getUsersSavedDocuments().then(
            function success(resp) {
                if (resp.status === 'error') {
                    if( JSON.stringify(notFound) ===  JSON.stringify(resp.errors)) {
                        self.userData = {articles:[]};
                    }
                }
                else {
                    self.userData = resp.savedArticles;
                }

                var saved = self.hasŬserSavedArticle(self.userData.articles, config.page.shortUrl);
                if (saved) {
                    self.$saver.html('<a href="' + self.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
                } else {
                    self.$saver.html('<a class="meta__save-for-later--link" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>');
                    bean.on(self.saveLinkHolder, 'click', '.meta__save-for-later--link', self.saveArticle.bind(self));
                }
            }
        );
    };

    SaveForLater.prototype.hasŬserSavedArticle = function(articles, shortUrl) {
        return _.some(articles, function(article) {
            return article.shortUrl === shortUrl;
        });
    };

    SaveForLater.prototype.saveArticle = function() {
        var self = this;
        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
        var date = new Date().toISOString().replace(/\.[0-9]+Z/,'+00:00');
        var newArticle = {id: document.location.href, shortUrl: config.page.shortUrl, date: date, read: false  };
        this.userData.articles.push(newArticle);
        var data = {version: date, articles: this.userData.articles };
        identity.saveToArticles(data).then(
            function success(resp) {
                if (resp.status === 'error') {
                    self.$saver.html('<a href="' + self.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Error saving</a>');
                }
                else {
                    bean.off(qwery('.meta__save-for-later--link', self.saveLinkHolder)[0], 'click', self.saveArticle);
                    self.$saver.html('<a href="' + self.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
                }
            }
        );
    };

    return SaveForLater;
});
