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
    'text!common/views/identity/saved-for-later-profile-link.html'
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
    profileLinkTmp
) {

    function SaveForLater() {
        this.classes = {
            saveThisArticle: '.js-save-for-later',
            saveThisVideo: '.js-save-for-later-video',
            saveThisArticleButton: '.js-save-for-later__button',
            profileDropdownCount: '.brand-bar__item--saved-for-later-count'
        };

        this.isContent = !/Network Front|Section|Tag/.test(config.page.contentType);
        this.userData = {};
        this.savedArticlesUrl = config.page.idUrl + '/saved-for-later';

        _.bindAll(this,
            'save',
            'delete',
            'onSaveArticle',
            'onDeleteArticle'
        );
    }

    var bookmarkSvg = svgs('bookmark', ['rounded-icon']),
        shortUrl = (config.page.shortUrl || '').replace('http://gu.com', ''),
        savedPlatformAnalytics = 'web:' + detect.getUserAgent.browser + ':' + detect.getBreakpoint();

    SaveForLater.prototype.init = function () {
        var userLoggedIn = identity.isUserLoggedIn();

        if (userLoggedIn) {
            identity.getSavedArticles()
                .then(function (resp) {
                    var notFound = { message: 'Not found', description: 'Resource not found' };
                    var popup = qwery('.popup--profile')[0];

                    fastdom.write(function () {
                        bonzo(popup).prepend(bonzo.create(
                            template(profileLinkTmp.replace(/^\s+|\s+$/gm, ''), {
                                idUrl: config.page.idUrl
                            })
                        ));
                        this.updateSavedCount();
                    }.bind(this));

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

                    this.renderSaveButtonsInArticle();
                }.bind(this));
        } else {
            var url = template('<%= idUrl%>/save-content?returnUrl=<%= returnUrl%>&shortUrl=<%= shortUrl%>&platform=<%= platform%>&INTCMP=SFL-SO', {
                idUrl: config.page.idUrl,
                returnUrl: encodeURIComponent(document.location.href),
                shortUrl: shortUrl,
                platform: savedPlatformAnalytics
            });
            this.renderArticleSaveButton({ url: url, isSaved: false });
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
                    _.assign({ url: options.url }, templateData))
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
        this.userData.articles = _.filter(this.userData.articles, function (article) {
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

    SaveForLater.prototype.getSavedArticle = function (shortUrl) {
        return _.some(this.userData.articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.prototype.updateSavedCount = function () {
        var saveForLaterProfileCount = $(this.classes.profileDropdownCount);
        var profile = $('.brand-bar__item--profile');
        var count = this.userData.articles.length;

        fastdom.write(function () {
            if (count > 0) {
                $('.save-for-later__icon', profile).attr('data-saved-content-count', count);
                saveForLaterProfileCount.text(count);
            } else {
                $('.save-for-later__icon', profile).removeAttr('data-saved-content-count');
                saveForLaterProfileCount.text('');
            }
        });
    };

    SaveForLater.prototype.saveIntroArticle = function () {
        var pageId = 'help/insideguardian/2015/jul/21/introducing-save-for-later';
        var shortUrl = '/p/4ab7x';

        this.saveArticle(pageId, shortUrl);
    };

    return SaveForLater;
});
