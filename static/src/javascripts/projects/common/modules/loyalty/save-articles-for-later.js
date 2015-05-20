define([
    'bean',
    'bonzo',
    'qwery',
    'fastdom',

    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',

    'common/modules/identity/api',

    'text!common/views/loyalty/save-for-later-front-link--signed-out.html',
    'text!common/views/loyalty/save-for-later-front-link--signed-in.html'
], function (
    bean,
    bonzo,
    qwery,
    fastdom,

    _,
    config,
    mediator,
    template,

    identity,
    signedOutLinkTemplate,
    signedInLinkTemplate
) {
    $ = function $(selector, context) {
        return bonzo(qwery(selector, context));
    };

    function SaveArticlesForLater() {
        this.userData = {version: 0, articles:[]};
        this.elements = [];
        this.templates = {
            signedIn: signedInLinkTemplate,
            signedOut: signedOutLinkTemplate
        };
        this.attributeName = 'data-loyalty-short-url';
    };

    SaveArticlesForLater.prototype.getElementsIndexedById = function (context) {
        var self = this,
            elements = qwery('[' + self.attributeName + ']', context);

        return _.forEach(elements, function(el){
            return bonzo(el).attr(self.attributeName)
        });
    };

    SaveArticlesForLater.prototype.getSavedArticles = function () {
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
            }
        );
    };

    SaveArticlesForLater.prototype.renderSaveLinks  = function(signedIn) {
        var self = this;

        fastdom.read(function() {

            //TODO inline id
            _.forEach(self.elements, function (node) {
               var $node = bonzo(node),
                    id = $node.attr('data-id'),
                    shortUrl = $node.attr('data-loyalty-short-url'),
                    isSavedAlready = self.hasUserSavedArticle(self.userData.articles, shortUrl),
                    saveUrl = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                        '&shortUrl=' + shortUrl + '&articleId=' + id,
                    templateName = self.templates[signedIn ? "signedIn" : "signedOut"],
                    linkText = isSavedAlready ? "Saved" : "Save",
                    html,
                    meta,
                    $container;

                html = template(templateName, {
                    link_text: linkText,
                    url: saveUrl
                });

                meta = qwery('.js-item__meta', node);

                $container = meta.length ? bonzo(meta) : $node;

                fastdom.write(function () {
                    $container.append(html);
                    if (signedIn) {
                        var saveLink = $('.save-for-later-link', node)[0];
                        if (isSavedAlready) {
                            bean.one(saveLink, 'click', self.unSaveArticleClick.bind(self, saveLink, id, shortUrl));
                        } else {
                            bean.one(saveLink, 'click', self.saveArticleClick.bind(self, saveLink, id, shortUrl));
                        }
                    }
                });
            });
        });
    };

    SaveArticlesForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };


    SaveArticlesForLater.prototype.saveArticleClick = function (saveLink, id, shortUrl){

        var self = this,
        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: id, shortUrl: shortUrl, date: date, read: false  };

        self.userData.articles.push(newArticle);

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                } else {
                    bonzo(qwery('.save-for-later-link__heading', saveLink)[0]).html('Saved');
                    bean.one(saveLink, 'click', self.unSaveArticleClick.bind(self, saveLink, id, shortUrl));
                }
            }
        );
    };

    SaveArticlesForLater.prototype.unSaveArticleClick = function(unsaveLink, id, shortUrl) {
        var self = this;

        self.userData.articles = _.filter(self.userData.articles, function (article) {
             return article.shortUrl !== shortUrl;
        });

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                    console.log("Error response");
                } else {
                    bonzo(qwery('.save-for-later-link__heading', unsaveLink)[0]).html('Save');
                    bean.one(unsaveLink, 'click', self.saveArticleClick.bind(self, unsaveLink, id, shortUrl));
                }
            }
        );
    };

    SaveArticlesForLater.prototype.init = function() {


        var self = this;

        this.elements = this.getElementsIndexedById(document.body);
        var userLoggedIn = identity.isUserLoggedIn();
        if (userLoggedIn) {
            this.getSavedArticles();
        } else {
            this.renderSaveLinks(false);
        }

        mediator.on('modules:related:loaded', function() {
            self.elements = self.getElementsIndexedById(document.body);
            self.renderSaveLinks(userLoggedIn);
        });

    };

    SaveArticlesForLater.prototype.getSavedArticles = function () {
        var self = this,
            notFound = {message: 'Not found', description: 'Resource not found'};

        identity.getSavedArticles().then(
            function success(resp) {
                if (resp.status === 'error') {
                   if (resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
                        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');
                        self.userData = {version: date, articles: []};
                    }
                } else {
                     self.userData = resp.savedArticles;
                }
                self.renderSaveLinks(true);
            }
        );
    };

    return SaveArticlesForLater;
});
