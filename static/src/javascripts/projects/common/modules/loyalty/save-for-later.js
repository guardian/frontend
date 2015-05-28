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
    'text!common/views/loyalty/save-for-later--signed-out.html',
    'text!common/views/loyalty/save-for-later--signed-in.html'
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
    saveForLaterOutTmpl,
    saveForLaterInTmpl
) {
    function SaveForLater() {
        this.saveLinkHolder = qwery('.js-save-for-later')[0];
        this.templates = {
            signedOutThisArticle: saveForLaterOutTmpl,
            signedInThisArticle: saveForLaterInTmpl
        };
        this.userData = null;
        this.savedArticlesUrl = config.page.idUrl + '/saved-for-later';
    }

    var bookmarkSvg = svgs('bookmark', ['i-left']);

    SaveForLater.prototype.init = function () {
        if (identity.isUserLoggedIn()) {
            this.getSavedArticles();
        } else {
            var url = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                '&shortUrl=' + this.shortUrl;
            this.renderSaveThisArticleLink(false, url, 'save');
        }
    };

    SaveForLater.prototype.renderSaveThisArticleLink = function (deferToClick, url, state) {

        var self = this,
            $saver = bonzo(qwery('.js-save-for-later')[0]),
            templateName = self.templates[deferToClick ? "signedInThisArticle" : "signedOutThisArticle"];

        $saver.html(template(templateName, {
                url: url,
                icon: bookmarkSvg,
                state: state
            })
        );
    };

    SaveForLater.prototype.getSavedArticles = function () {
        var self = this,
            saveLinkHolder = qwery('.js-save-for-later')[0],
            shortUrl = config.page.shortUrl.replace('http://gu.com', ''),
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

                if (self.hasUserSavedArticle(self.userData.articles, shortUrl)) {
                    self.renderSaveThisArticleLink(false, self.savedArticlesUrl, 'saved');
                } else {
                    self.renderSaveThisArticleLink(true, '', 'save');
                    bean.one(saveLinkHolder, 'click', '.save-for-later__button',
                        self.saveArticle.bind(self, config.page.pageId, shortUrl
                    ));
                }
            }
        );
    };

    SaveForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.prototype.saveArticle = function (pageId, shortUrl) {
        var self = this,
            //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: pageId, shortUrl: shortUrl, date: date, read: false  };

        self.userData.articles.push(newArticle);

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                    self.renderSaveThisArticleLink(true, '', 'save');
                } else {
                    self.renderSaveThisArticleLink(false, self.savedArticlesUrl, 'saved');
                }
            }
        );
    };

    return SaveForLater;
});
