define([
    'qwery',
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/views/svgs',
    'text!common/views/save-for-later/save-link.html',
    'text!common/views/save-for-later/save-button.html',
    'lodash/functions/bindAll',
    'lodash/objects/assign',
    'lodash/collections/forEach',
    'lodash/collections/filter',
    'lodash/collections/some'
], function (
    qwery,
    bonzo,
    bean,
    fastdom,
    _,
    $,
    detect,
    config,
    mediator,
    template,
    identity,
    svgs,
    saveLink,
    saveButton,
    bindAll,
    assign,
    forEach,
    filter,
    some) {

    function SaveForLater() {
        this.classes = {
            saveThisArticle: '.js-save-for-later',
            saveThisVideo: '.js-save-for-later-video',
            saveThisArticleButton: '.js-save-for-later__button',
            onwardContainer: '.js-onward',
            relatedContainer: '.js-related',
            showMoreContainer: '.js-show-more',
            itemMeta: '.js-item__meta',
            itemSaveLink: '.js-save-for-later-link',
            itemSaveLinkHeading: '.save-for-later-link__heading',
            fcItemIsSaved: 'fc-save-for-later--is-saved',
            profileDropdownLink: '.brand-bar__item--saved-for-later',
            identityProfileItem: '.js-profile-nav'
        };
        this.attributes = {
            containerItemShortUrl: 'data-loyalty-short-url',
            containerItemDataId: 'data-id'
        };


        this.isContent = !/Network Front|Section|Tag/.test(config.page.contentType);
        this.userData = {};

        bindAll(this,
            'save',
            'delete',
            'onSaveArticle',
            'onDeleteArticle',
            'createSaveFaciaItemHandler',
            'createDeleteFaciaItemHandler',
            'signUserInToSaveArticle'
        );
    }

    var bookmarkSvg = svgs('bookmark', ['rounded-icon']),
        shortUrl = (config.page.shortUrl || '').replace('http://gu.com', ''),
        savedPlatformAnalytics = 'web:' + detect.getUserAgent.browser + ':' + detect.getBreakpoint();

    var getCustomEventProperties = function (contentId) {
        var prefix = config.page.contentType.match(/^Network Front|Section$/) ? 'Front' : 'Content';
        return { prop74: prefix + 'ContainerSave:' + contentId };
    };

    SaveForLater.prototype.init = function () {
        var userLoggedIn = identity.isUserLoggedIn();

        if (userLoggedIn) {
            identity.getSavedArticles()
                .then(function (resp) {
                    var notFound = { message: 'Not found', description: 'Resource not found' };

                    if (resp.status === 'error' && resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                        // this user has never saved anything, so create a new
                        // data object and save an introductory article for them

                        // Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
                        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');
                        this.userData = {version: date, articles: []};
                        this.saveIntroArticle();
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
                var url = template('<%= idUrl%>/save-content?INTCMP=DOTCOM_ARTICLE_SFL&returnUrl=<%= returnUrl%>&shortUrl=<%= shortUrl%>&platform=<%= platform%>', {
                    idUrl: config.page.idUrl,
                    returnUrl: encodeURIComponent(document.location.href),
                    shortUrl: shortUrl,
                    platform: savedPlatformAnalytics
                });
                this.renderArticleSaveButton({ url: url, isSaved: false });
            }
        }

    };


    SaveForLater.prototype.renderSaveButtonsInArticle = function () {
        if (this.getSavedArticle(shortUrl)) {
            this.renderArticleSaveButton({ isSaved: true });
        } else {
            this.renderArticleSaveButton({ isSaved: false });
        }
    };

    SaveForLater.prototype.renderArticleSaveButton = function (options) {
        var $savers = bonzo(qwery(this.classes.saveThisArticle));

        $savers.each(function (saver) {
            var $saver = bonzo(saver);
            $saver.css('display', 'block');
            var templateData = {
                icon: bookmarkSvg,
                isSaved: options.isSaved,
                position: $saver.attr('data-position'),
                config: config
            };
            if (options.url) {
                $saver.html(template(saveLink,
                    assign({ url: options.url }, templateData))
                );
            } else {
                $saver.html(template(saveButton, templateData));

                bean.one($saver[0], 'click', this.classes.saveThisArticleButton,
                    this[options.isSaved ? 'deleteArticle' : 'saveArticle'].bind(this,
                        config.page.pageId,
                        shortUrl
                    )
                );
            }
        }.bind(this));
    };

    SaveForLater.prototype.getElementsIndexedById = function (context) {
        var elements = qwery('[' + this.attributes.containerItemShortUrl + ']', context);

        return forEach(elements, function (el) {
            return bonzo(el).attr(this.attributes.containerItemShortUrl);
        }.bind(this));
    };

    SaveForLater.prototype.prepareFaciaItemLinks = function (signedIn) {

        this.renderFaciaItemLinks(signedIn, document.body);

        mediator.once('modules:tonal:loaded', function () {
            this.renderFaciaItemLinks(signedIn, this.classes.onwardContainer);
        }.bind(this));

        mediator.once('modules:onward:loaded', function () {
            this.renderFaciaItemLinks(signedIn, this.classes.onwardContainer);
        }.bind(this));

        mediator.once('modules:tonal:loaded', function () {
            this.renderFaciaItemLinks(signedIn, this.classes.onwardContainer);
        }.bind(this));

        mediator.once('modules:related:loaded', function () {
            this.renderFaciaItemLinks(signedIn, this.classes.relatedContainer);
        }.bind(this));

        mediator.on('modules:show-more:loaded', function () {
            this.renderFaciaItemLinks(signedIn, this.classes.showMoreContainer);
            $(this.classes.showMoreContainer).removeClass('js-show-more');
        }.bind(this));
    };

    // Configure the save for later links on a front or in a container
    SaveForLater.prototype.renderFaciaItemLinks = function (signedIn, context) {
        var elements = this.getElementsIndexedById(context);

        forEach(elements, function (item) {
            var $item = $(item),
                $itemSaveLink = $(this.classes.itemSaveLink, item),
                shortUrl = item.getAttribute(this.attributes.containerItemShortUrl),
                id = item.getAttribute(this.attributes.containerItemDataId),
                isSaved = signedIn ? this.getSavedArticle(shortUrl) : false;

            if (signedIn) {
                this[isSaved ? 'createDeleteFaciaItemHandler' : 'createSaveFaciaItemHandler']($itemSaveLink[0], id, shortUrl);
            } else {
                bean.one($itemSaveLink[0], 'click', function (id, shortUrl) {
                    this.signUserInToSaveArticle(id, shortUrl);
                }.bind(this, id, shortUrl));
            }


            fastdom.write(function () {
                if (isSaved) {
                    $itemSaveLink.addClass(this.classes.fcItemIsSaved);
                } else {
                    var contentId = $($.ancestor($itemSaveLink[0], 'fc-item')).attr('data-id');
                    $itemSaveLink.attr('data-custom-event-properties', JSON.stringify(getCustomEventProperties(contentId)));
                }
                $itemSaveLink.attr('data-link-name', isSaved ? 'Unsave' : 'Save');

                // only while in test
                $item.addClass('fc-item--has-metadata');
                $itemSaveLink.removeClass('is-hidden');
            }.bind(this));
        }.bind(this));
    };

    // generic functions to save/delete an article, from anywhere
    SaveForLater.prototype.save = function (pageId, shortUrl, onSave) {
        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {
                id: pageId,
                shortUrl: shortUrl,
                date: date,
                read: false,
                platform: savedPlatformAnalytics
            };

        this.userData.articles.push(newArticle);

        identity.saveToArticles(this.userData).then(
            function (resp) {
                onSave(resp.status !== 'error');
            }
        );
    };

    SaveForLater.prototype.delete = function (pageId, shortUrl, onDelete) {
        this.userData.articles = filter(this.userData.articles, function (article) {
            return article.shortUrl !== shortUrl;
        });

        identity.saveToArticles(this.userData).then(
            function (resp) {
                onDelete(resp.status !== 'error');
            }
        );
    };

    // handle saving/deleting from content pages
    SaveForLater.prototype.saveArticle = function (pageId, shortUrl) {
        this.save(pageId, shortUrl, this.onSaveArticle);
    };

    SaveForLater.prototype.onSaveArticle = function (success) {
        this.renderArticleSaveButton({ isSaved: success });
        if (success) {
            this.updateSavedCount();
        }
    };

    SaveForLater.prototype.deleteArticle = function (pageId, shortUrl) {
        this.delete(pageId, shortUrl, this.onDeleteArticle);
    };

    SaveForLater.prototype.onDeleteArticle = function (success) {
        this.renderArticleSaveButton({ isSaved: !success });
        if (success) {
            this.updateSavedCount();
        }
    };

    // handle saving/deleting from fronts

    SaveForLater.prototype.saveFaciaItem = function (pageId, shortUrl) {
        this.save(pageId, shortUrl, this.onSaveFaciaItem);
    };

    SaveForLater.prototype.onSaveFaciaItem = function (link, id, shortUrl, success) {
        var that = this;
        if (success) {
            this.createDeleteFaciaItemHandler(link, id, shortUrl);
            this.updateSavedCount();

            fastdom.write(function () {
                bonzo(link)
                    .addClass(that.classes.fcItemIsSaved)
                    .attr('data-link-name', 'Unsave')
                    .attr('data-custom-event-properties', '');
            });
        } else {
            this.createSaveFaciaItemHandler(link, id, shortUrl);

            fastdom.write(function () {
                bonzo(qwery(that.classes.itemSaveLinkHeading, link)[0]).html('Error Saving');
            });
        }
    };

    SaveForLater.prototype.deleteFaciaItem = function (pageId, shortUrl) {
        this.save(pageId, shortUrl, this.onDeleteFaciaItem);
    };

    SaveForLater.prototype.onDeleteFaciaItem = function (link, id, shortUrl, success) {
        var that = this;
        if (success) {
            this.createSaveFaciaItemHandler(link, id, shortUrl);
            this.updateSavedCount();

            fastdom.write(function () {
                var contentId = $($.ancestor(link, 'fc-item')).attr('data-id');
                bonzo(link)
                    .removeClass(that.classes.fcItemIsSaved)
                    .attr('data-link-name', 'Save')
                    .attr('data-custom-event-properties', JSON.stringify(getCustomEventProperties(contentId)));
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
                id,
                shortUrl,
                this.onSaveFaciaItem.bind(this, link, id, shortUrl)
            )
        );
    };

    SaveForLater.prototype.signUserInToSaveArticle = function (id, shortUrl) {
        var url = template('<%= idUrl%>/save-content?returnUrl=<%= returnUrl%>&shortUrl=<%= shortUrl%>&platform=<%= platform%>&articleId=<%= articleId %>&INTCMP=SFL-SO', {
            idUrl: config.page.idUrl,
            returnUrl: encodeURIComponent(document.location.href),
            shortUrl: shortUrl,
            platform: savedPlatformAnalytics,
            articleId: id
        });
        window.location = url;
    };

    SaveForLater.prototype.createDeleteFaciaItemHandler = function (link, id, shortUrl) {
        bean.one(link, 'click',
            this.delete.bind(this,
                id,
                shortUrl,
                this.onDeleteFaciaItem.bind(this, link, id, shortUrl)
            )
        );
    };

    SaveForLater.prototype.getSavedArticle = function (shortUrl) {
        return some(this.userData.articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.prototype.updateSavedCount = function () {
        var $saveForLaterEl = $(this.classes.profileDropdownLink),
            $profileDropdownItem = $(this.classes.identityProfileItem),
            count = (this.userData.articles) ? this.userData.articles.length : 0;

        if (count > 0) {
            $saveForLaterEl.attr('data-saved-content-count', count);
            $profileDropdownItem.addClass('has-saved-articles');
        } else {
            $saveForLaterEl.removeAttr('data-saved-content-count', count);
            $profileDropdownItem.removeClass('has-saved-articles');
        }
    };

    SaveForLater.prototype.saveIntroArticle = function () {
        var pageId = 'help/insideguardian/2015/jul/21/introducing-save-for-later';
        var shortUrl = '/p/4ab7x';

        this.saveArticle(pageId, shortUrl);
    };

    return SaveForLater;
});
