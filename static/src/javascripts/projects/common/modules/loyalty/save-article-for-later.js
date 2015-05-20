define([
    'qwery',
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/identity/api'
    ],

    function(
    qwery,
    bonzo,
    bean,
    fastdom,
    _,
    config,
    mediator,
    identity

) {
    function SaveArticle() {
        this.saveLinkHolder = qwery('.meta__save-for-later')[0];
        this.userData = null;
        this.pageId = config.page.pageId;
        this.$saver = bonzo(this.saveLinkHolder);
        this.savedArticlesUrl = config.page.idUrl + '/saved-for-later';
        this.shortUrl = config.page.shortUrl.replace('http://gu.com', '');   //  Keep the fitst trailing slash
    }

    SaveArticle.prototype.init = function () {
        var userLoggedIn = identity.isUserLoggedIn();
        if (userLoggedIn) {
            console.log("++ Signed");
            this.getSavedArticles(this.onGetSavedArticles.bind(this));
        } else {
            var url = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                '&shortUrl=' + this.shortUrl;
            this.$saver.html(
                '<a href="' + url + ' "data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>'
            );
        }
    };


    //*
    SaveArticle.prototype.getSavedArticles = function (onGetSavedArticles) {
        var self = this,
            notFound  = {message:'Not found', description:'Resource not found'};

        console.log("++ Get Atricles");
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
                onGetSavedArticles();
            }
        );
    };

    //--- Get articles

    SaveArticle.prototype.onGetSavedArticles = function () {

        var hello = "hello";
        console.log("+++  Hello");
        if (this.hasUserSavedArticle(this.userData.articles, this.shortUrl)) {
            console.log("++ Saaved");
            this.$saver.html('<a href="' + this.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
        } else {
            console.log("++ Not Saaved");
            this.$saver.html('<a class="meta__save-for-later--link" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>');
            bean.one(this.saveLinkHolder, 'click', '.meta__save-for-later--link',
                this.saveThisArticle.bind(this,
                    this.onSaveThisArticle.bind(this, hello),
                    this.onSaveThisArticleError.bind(this, "goodbye"),
                    this.userData,
                    this.pageId, this.shortUrl));
        }
    };

    //-------------------------Save Article

    SaveArticle.prototype.saveThisArticle = function (onArticleSaved, onArticleSavedError, userData, pageId, shortUrl) {
        var self = this,
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: pageId, shortUrl: shortUrl, date: date, read: false  };

        userData.articles.push(newArticle);

        identity.saveToArticles(userData).then(
            function(resp) {
                if(resp.status === 'error') {
                     console.log("Resp Failure");
                     onArticleSavedError();
                }
                else {
                    console.log("Resp success");
                    onArticleSaved();
                }
            }
        );
    };

    SaveArticle.prototype.onSaveThisArticle = function (message) {
        console.log("++++++++++++++ Error " + message);
        this.$saver.html('<a href="' + this.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
    };

    SaveArticle.prototype.onSaveThisArticleError = function(message) {
        console.log("++++++++++++++ Success " + message);
        this.$saver.html('<a href="' + this.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Error saving</a>');
    };

    SaveArticle.prototype.onSaveArticle = function (resp, unsaveLink, id, shortUrl) {
        var self = this;
        if (resp.status === 'error') {
            console.log("Error response");
        } else {
            bonzo(qwery('.save-for-later-link__heading', unsaveLink)[0]).html('Save');
            bean.one(unsaveLink, 'click', self.saveArticleClick.bind(self, unsaveLink, id, shortUrl));
        }
    };

    SaveArticle.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };


    return SaveArticle;
});
