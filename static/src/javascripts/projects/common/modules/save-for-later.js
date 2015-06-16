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
    'text!common/views/save-for-later/save-link.html',
    'text!common/views/save-for-later/save-button.html'
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
    saveLink,
    saveButton
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

        _.bindAll(this,
            'save',
            'delete',
            'onSaveArticle',
            'onDeleteArticle',
            'createSaveFaciaItemHandler',
            'createDeleteFaciaItemHandler'
        );
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

                    this.updateSavedCount();
                    this.prepareFaciaItemLinks(true);

                    if (this.isContent) {
                        this.renderSaveButtonsInArticle();
                    }
                }.bind(this));
        } else {
            if (this.isContent) {
                var url = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                    '&shortUrl=' + config.page.shortUrl.replace('http://gu.com', '');
                this.renderArticleSaveButton({ url: url, isSaved: false });
            }
            this.prepareFaciaItemLinks(false);
        }
    };

    SaveForLater.prototype.renderSaveButtonsInArticle = function () {
        if (this.hasUserSavedArticle(this.userData.articles, shortUrl)) {
            this.renderArticleSaveButton({ isSaved: true });
        } else {
            this.renderArticleSaveButton({ isSaved: false });
        }
    };

    SaveForLater.prototype.renderArticleSaveButton = function (options) {
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
                $saver.html(template(saveLink,
                    _.assign({ url: options.url }, templateData))
                );
            } else {
                $saver.html(template(saveButton, templateData));

                bean.one($saver[0], 'click', this.classes.saveThisArticleButton,
                        this.userData,
                        config.page.pageId,
                        shortUrl
                    )
                );
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

    SaveForLater.prototype.prepareFaciaItemLinks = function (signedIn) {
        var self = this;

        if (!self.isContent) {
            self.renderFaciaItemLinks(signedIn, document.body);
        }

        mediator.on('modules:tonal:loaded', function () {
            self.renderFaciaItemLinks(signedIn, self.classes.onwardContainer);
        });

        mediator.on('modules:onward:loaded', function () {
            self.renderFaciaItemLinks(signedIn, self.classes.onwardContainer);
        });

        mediator.on('modules:related:loaded', function () {
            self.renderFaciaItemLinks(signedIn, self.classes.relatedContainer);
        });
    };

    // Configure the save for later links on a front or in a container
    SaveForLater.prototype.renderFaciaItemLinks = function (signedIn, context) {
        var self = this,
            elements = self.getElementsIndexedById(context);

        _.forEach(elements, function (item) {
            var $item = $(item),
                $itemSaveLink = $(self.classes.itemSaveLink, item),
                shortUrl = item.getAttribute(self.attributes.containerItemShortUrl),
                id = item.getAttribute(self.attributes.containerItemDataId),
                isSaved = signedIn ? self.hasUserSavedArticle(self.userData.articles, shortUrl) : false;

            if (signedIn) {
                self[isSaved ? 'createDeleteFaciaItemHandler' : 'createSaveFaciaItemHandler']($itemSaveLink[0], id, shortUrl);
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

    // generic functions to save/delete an article, from anywhere

    SaveForLater.prototype.save = function (userData, pageId, shortUrl, onSave) {
        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {
                id: pageId,
                shortUrl: shortUrl,
                date: date,
                read: false
            };

        userData.articles.push(newArticle);

        identity.saveToArticles(userData).then(
            function (resp) {
                onSave(resp.status !== 'error');
            }
        );
    };

    SaveForLater.prototype.delete = function (userData, pageId, shortUrl, onDelete) {
        userData.articles = _.filter(userData.articles, function (article) {
            return article.shortUrl !== shortUrl;
        });

        identity.saveToArticles(userData).then(
            function (resp) {
                onDelete(resp.status !== 'error');
            }
        );
    };

    // handle saving/deleting from content pages

    SaveForLater.prototype.saveArticle = function (userData, pageId, shortUrl) {
        this.save(userData, pageId, shortUrl, this.onSaveArticle)
    };

    SaveForLater.prototype.onSaveArticle = function (success) {
        this.renderArticleSaveButton({ isSaved: success });
        if (success) {
            this.updateSavedCount();
        }
    };

    SaveForLater.prototype.deleteArticle = function (userData, pageId, shortUrl) {
        this.delete(userData, pageId, shortUrl, this.onDeleteArticle);
    };

    SaveForLater.prototype.onDeleteArticle = function (success) {
        this.renderArticleSaveButton({ isSaved: !success });
        if (success) {
            this.updateSavedCount();
        }
    };

    // handle saving/deleting from fronts

    SaveForLater.prototype.saveFaciaItem = function (userData, pageId, shortUrl) {
        this.save(userData, pageId, shortUrl, this.onSaveFaciaItem)
    };

    SaveForLater.prototype.onSaveFaciaItem = function (link, id, shortUrl, success) {
        var that = this;
        if (success) {
            this.createDeleteFaciaItemHandler(link, id, shortUrl);

            fastdom.write(function () {
                bonzo(link).addClass(that.classes.fcItemIsSaved);
            });
        } else {
            this.createSaveFaciaItemHandler(link, id, shortUrl);

            fastdom.write(function () {
                bonzo(qwery(that.classes.itemSaveLinkHeading, link)[0]).html('Error Saving');
            });
        }
    };

    SaveForLater.prototype.deleteFaciaItem = function (userData, pageId, shortUrl) {
        this.save(userData, pageId, shortUrl, this.onDeleteFaciaItem)
    };

    SaveForLater.prototype.onDeleteFaciaItem = function (link, id, shortUrl, success) {
        var that = this;
        if (success) {
            this.createSaveFaciaItemHandler(link, id, shortUrl);

            fastdom.write(function () {
                bonzo(link).removeClass(that.classes.fcItemIsSaved);
            });
        } else {
            this.createDeleteFaciaItemHandler(link, id, shortUrl);

            fastdom.write(function () {
                bonzo(qwery(that.classes.itemSaveLinkHeading, link)[0]).html('Error Removing');
            });
        }
    };

    //--Create container link click handlers
    SaveForLater.prototype.createSaveFaciaItemHandler = function (link, id, shortUrl) {
        bean.one(link, 'click',
            this.save.bind(this,
                this.userData,
                id,
                shortUrl,
                this.onSaveFaciaItem.bind(this, link, id, shortUrl)
            )
        );
    };

    SaveForLater.prototype.createDeleteFaciaItemHandler = function (link, id, shortUrl) {
        bean.one(link, 'click',
            this.delete.bind(this,
                this.userData,
                id,
                shortUrl,
                this.onDeleteFaciaItem.bind(this, link, id, shortUrl)
            )
        );
    };

    ///------------------------------Utils
    SaveForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.prototype.updateSavedCount = function () {
        var saveForLaterProfileLink = $(this.classes.profileDropdownLink);
        saveForLaterProfileLink.html('Saved (' + this.userData.articles.length + ')');
    };

    return SaveForLater;
});
