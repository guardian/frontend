define([
    'qwery',
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/views/svgs',
    'text!common/views/loyalty/save-for-later-link.html',
    'text!common/views/loyalty/save-for-later-button.html'
], function (
    qwery,
    bonzo,
    bean,
    fastdom,
    _,
    detect,
    config,
    mediator,
    template,
    identity,
    svgs,
    saveForLaterLinkTmpl,
    saveForLaterButtonTmpl
) {
    //This is because of some a/b test wierdness - '$' doesn't work
    var $ = function (selector, context) {
        return bonzo(qwery(selector, context));
    };

    function SaveForLater() {
        this.classes = {
            saveThisArticle: '.js-save-for-later',
            saveThisVideo: '.js-save-for-later-video',
            saveThisArticleButton: '.js-save-for-later__button',
            onwardContainer: '.js-onward',
            relatedContainer: '.js-related',
            itemMeta: '.js-item__meta',
            itemSaveLink: '.js-save-for-later-link',
            itemSaveLinkHeading: '.save-for-later-link__heading',
            profileDropdownLink: '.brand-bar__item--saved-for-later',
            fcItemIsSaved: 'fc-save-for-later--is-saved'
        };
        this.attributes = {
            containerItemShortUrl: 'data-loyalty-short-url',
            containerItemDataId: 'data-id'
        };

        this.isContent = !/Network Front|Section/.test(config.page.contentType);
        this.userData = null;
        this.savedArticlesUrl = config.page.idUrl + '/saved-for-later-page';
    }

    var bookmarkSvg = svgs('bookmark', ['i-left']);
    var shortUrl = (config.page.shortUrl || '').replace('http://gu.com', '');

    SaveForLater.prototype.init = function () {
        var userLoggedIn = identity.isUserLoggedIn();
        if (userLoggedIn) {
            identity.getSavedArticles()
                .then(function (resp) {
                    var notFound = { message: 'Not found', description: 'Resource not found' };
                    if (resp.status === 'error' && resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
                        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');
                        this.userData = {version: date, articles:[]};
                    } else {
                        this.userData = resp.savedArticles;
                    }

                    this.renderLinksInContainers(true);
                    if (this.isContent) {
                        this.renderLinksInContent();
                    }
                    this.updateArticleCount();
                }.bind(this));
        } else {
            if (this.isContent) {
                var url = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                    '&shortUrl=' + config.page.shortUrl.replace('http://gu.com', '');
                this.renderSaveThisArticleElement({ url: url, isSaved: false });
            }
            this.renderLinksInContainers(false);
        }
    };

    SaveForLater.prototype.renderSaveThisArticleElement = function (options) {
        var $savers = bonzo(qwery(this.classes.saveThisArticle));

        $savers.each(function (saver) {
            var $saver = bonzo(saver);
            var templateData = {
                icon: bookmarkSvg,
                isSaved: options.isSaved,
                position: $saver.attr('data-position'),
                config: config
            };
            if (options.url) {
                $saver.html(template(saveForLaterLinkTmpl,
                    _.assign({ url: options.url }, templateData)));
            } else {
                $saver.html(template(saveForLaterButtonTmpl, templateData));

                bean.one($saver[0], 'click', this.classes.saveThisArticleButton,
                    this.saveArticle.bind(this,
                        this.onSaveThisArticle.bind(this),
                        this.onSaveThisArticleError.bind(this),
                        this.userData,
                        config.page.pageId, shortUrl));
            }
        }.bind(this));
    };

    SaveForLater.prototype.getElementsIndexedById = function (context) {
        var self = this,
            elements = qwery('[' + self.attributes.containerItemShortUrl + ']', context);

        return _.forEach(elements, function (el) {
            return bonzo(el).attr(self.attributes.containerItemShortUrl);
        });
    };

    SaveForLater.prototype.renderLinksInContainers = function (signedIn) {
        var self = this;

        if (!self.isContent) {
            self.renderContainerLinks(signedIn, document.body);
        }

        mediator.on('modules:tonal:loaded', function () {
            self.renderContainerLinks(signedIn, self.classes.onwardContainer);
        });

        mediator.on('modules:onward:loaded', function () {
            self.renderContainerLinks(signedIn, self.classes.onwardContainer);
        });

        mediator.on('modules:related:loaded', function () {
            self.renderContainerLinks(signedIn, self.classes.relatedContainer);
        });
    };

    SaveForLater.prototype.renderLinksInContent = function () {
        if (this.hasUserSavedArticle(this.userData.articles, shortUrl)) {
            this.renderSaveThisArticleElement({ url: this.savedArticlesUrl, isSaved: true });
        } else {
            this.renderSaveThisArticleElement({ isSaved: false });
        }
    };

    // Configure the save for later links on a front or in a container
    SaveForLater.prototype.renderContainerLinks = function (signedIn, context) {
        var self = this,
            elements = self.getElementsIndexedById(context);

        _.forEach(elements, function (item) {
            var $item = $(item),
                $itemSaveLink = $(self.classes.itemSaveLink, item),
                shortUrl = item.getAttribute(self.attributes.containerItemShortUrl),
                id = item.getAttribute(self.attributes.containerItemDataId),
                isSaved = signedIn ? self.hasUserSavedArticle(self.userData.articles, shortUrl) : false;

            if (signedIn) {
                self[isSaved ? 'createDeleteArticleHandler' : 'createSaveArticleHandler']($itemSaveLink[0], id, shortUrl);
            }

            fastdom.write(function () {
                if (isSaved) {
                    $itemSaveLink.addClass(self.classes.fcItemIsSaved);
                }
                $item.addClass('fc-item--has-metadata'); // while in test
                $itemSaveLink.removeClass('is-hidden'); // while in test
            });
        });
    };

        //--- Get articles
    // -------------------------Save Article
    SaveForLater.prototype.saveArticle = function (onArticleSaved, onArticleSavedError, userData, pageId, shortUrl) {
        var self = this,
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: pageId, shortUrl: shortUrl, date: date, read: false  };

        userData.articles.push(newArticle);

        identity.saveToArticles(userData).then(
            function (resp) {
                if (resp.status === 'error') {
                    onArticleSavedError();
                } else {
                    self.updateArticleCount();
                    onArticleSaved();
                }
            }
        );
    };

    SaveForLater.prototype.deleteArticle = function (onArticleDeleted, onArticleDeletedError, userData, pageId, shortUrl, event) {
        event.stop();

        var self = this;

        userData.articles = _.filter(userData.articles, function (article) {
            return article.shortUrl !== shortUrl;
        });

        identity.saveToArticles(userData).then(
            function (resp) {
                if (resp.status === 'error') {
                    onArticleDeletedError();
                } else {
                    self.updateArticleCount();
                    onArticleDeleted();
                }
            }
        );
    };

    //If this is an article Page, configure the save article link

    SaveForLater.prototype.onSaveThisArticle = function () {
        this.renderSaveThisArticleElement({ url: this.savedArticlesUrl, isSaved: true });
    };

    SaveForLater.prototype.onSaveThisArticleError = function () {
        this.renderSaveThisArticleElement({ isSaved: false });
    };

    //--- Handle saving an article on a front of container
    SaveForLater.prototype.onSaveArticle = function (link, id, shortUrl) {
        var self = this;
        self.createDeleteArticleHandler(link, id, shortUrl);

        fastdom.write(function () {
            bonzo(link).addClass(self.classes.fcItemIsSaved);
        });
    };

    SaveForLater.prototype.onSaveArticleError = function (link, id, shortUrl) {
        var self = this;
        self.createSaveArticleHandler(link, id, shortUrl);

        fastdom.write(function () {
            bonzo(qwery(self.classes.itemSaveLinkHeading, link)[0]).html('Error Saving');
        });
    };

    SaveForLater.prototype.onDeleteArticle = function (link, id, shortUrl) {
        var self = this;
        self.createSaveArticleHandler(link, id, shortUrl);

        fastdom.write(function () {
            bonzo(link).removeClass(self.classes.fcItemIsSaved);
        });
    };

    SaveForLater.prototype.onDeleteArticleError = function (link, id, shortUrl) {
        var self = this;
        self.createDeleteArticleHandler(link, id, shortUrl);

        fastdom.write(function () {
            bonzo(qwery(self.classes.itemSaveLinkHeading, link)[0]).html('Error Removing');
        });
    };

    //--Create container link click handlers
    SaveForLater.prototype.createSaveArticleHandler = function (saveLink, id, shortUrl) {
        var self = this;

        bean.one(saveLink, 'click',
            self.saveArticle.bind(self,
                self.onSaveArticle.bind(self, saveLink, id, shortUrl),
                self.onSaveArticleError.bind(self, saveLink, id, shortUrl),
                self.userData,
                id,
                shortUrl
            )
        );
    };

    SaveForLater.prototype.createDeleteArticleHandler = function (deleteLink, id, shortUrl) {
        var self = this;

        bean.one(deleteLink, 'click',
            self.deleteArticle.bind(self,
                self.onDeleteArticle.bind(self, deleteLink, id, shortUrl),
                self.onDeleteArticleError.bind(self, deleteLink, id, shortUrl),
                self.userData,
                id,
                shortUrl
            )
        );
    };

    ///------------------------------Utils
    SaveForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.prototype.updateArticleCount = function () {
        var self = this,
            saveForLaterProfileLink = $(self.classes.profileDropdownLink);

        saveForLaterProfileLink.html('Saved (' + self.userData.articles.length + ')');
    };

    return SaveForLater;
});
