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
    'text!common/views/loyalty/save-for-later--signed-out.html',
    'text!common/views/loyalty/save-for-later--signed-in.html',

    'text!common/views/loyalty/save-for-later-front-link--signed-out.html',
    'text!common/views/loyalty/save-for-later-front-link--signed-in.html'
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
    saveForLaterOutTmpl,
    saveForLaterInTmpl,

    signedOutLinkTmpl,
    signedInLinkTmpl

) {
    //This is because of some a/b test wierdness - '$' doesn't work
    var $ = function(selector, context) {
        return bonzo(qwery(selector, context));
    };

    function SaveForLater() {
        console.log("++ New");
        this.classes = {
             saveThisArticle: '.js-save-for-later'
        };
        this.isContent = !/Network Front|Section/.test(config.page.contentType);
        console.log("+++ New " + this.isContent);
        this.userData = null;
        console.log("++ New 1" );
        this.savedArticlesUrl = config.page.idUrl + '/saved-for-later';
        console.log("++ New 2 ");
        this.elements = [];
        this.attributeName = 'data-loyalty-short-url';
        this.templates = {
            signedIn: signedInLinkTmpl,
            signedOut: signedOutLinkTmpl,
            signedOutThisArticle: saveForLaterOutTmpl,
            signedInThisArticle: saveForLaterInTmpl
        };
    }

    var bookmarkSvg = svgs('bookmark', ['i-left']);

    SaveForLater.prototype.init = function () {
        console.log("Init");
        var userLoggedIn = identity.isUserLoggedIn();
        if (userLoggedIn) {
            console.log("++ Signed In " + this.isContent);
            this.getSavedArticles();
        } else {
            if (this.isContent) {
                var url = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                    '&shortUrl=' + config.page.shortUrl.replace('http://gu.com', '');
                this.renderSaveThisArticleLink(false, url, 'save');
            }
            this.renderLinksInContainers(false);
        }
    };


    SaveForLater.prototype.renderSaveThisArticleLink = function (deferToClick, url, state) {

         console.log("++ Render");
         var self = this,
             $saver = bonzo(qwery(self.classes['saveThisArticle'])[0]),
             templateName = self.templates[deferToClick ? "signedInThisArticle" : "signedOutThisArticle"];

         console.log("++ Q");

         $saver.html(template(templateName, {
                 url: url,
                 icon: bookmarkSvg,
                 state: state
             })
         );
        console.log("++ Done");

    };

    SaveForLater.prototype.getElementsIndexedById = function (context) {
        var self = this,
            elements = qwery('[' + self.attributeName + ']', context);

        return _.forEach(elements, function(el){
            return bonzo(el).attr(self.attributeName)
        });
    };

    SaveForLater.prototype.getSavedArticles = function () {
        var self = this,
            notFound  = {message:'Not found', description:'Resource not found'};

        console.log("+++ Get the Atricles");
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

                self.renderLinksInContainers(true);
                if ( self.isContent ) {
                    self.configureSaveThisArticle();
                }
                self.updateArticleCount();
            }
        );
    };

    SaveForLater.prototype.renderLinksInContainers = function(signedIn) {

        var self = this;

        if( !self.isContent ) {
            console.log("Render front pages");
            self.renderContainerLinks(signedIn, document.body)
        }

        mediator.on('modules:onward:loaded', function() {
            console.log("+++ Got Onwards");
            self.renderContainerLinks(signedIn, '.js-onward');
        });

        mediator.on('modules:related:loaded', function() {
            console.log("+++ Got related");
            self.renderContainerLinks(signedIn,'.js-related');
        });
    };

    SaveForLater.prototype.configureSaveThisArticle = function () {

        console.log("Conf");
        console.log("Conf " + this.classes['saveThisArticle']);

        var saveLinkHolder = qwery(this.classes['saveThisArticle'])[0],
            shortUrl = config.page.shortUrl.replace('http://gu.com', ''),
            hello = "hello";

        console.log("+++  Hello");


        if (this.hasUserSavedArticle(this.userData.articles, shortUrl)) {
            console.log("++ Saaved");
            this.renderSaveThisArticleLink(false, this.savedArticlesUrl, 'saved');
            //this.$saver.html('<a href="' + this.savedArticlesUrl + '" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Saved Articles</a>');
        } else {
            console.log("++ Not Saaved");
            this.renderSaveThisArticleLink(true, '', 'save');

            //this.$saver.html('<a class="meta__save-for-later--link" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>');
            bean.one(saveLinkHolder, 'click', '.save-for-later__button',
                this.saveThisArticle.bind(this,
                    this.onSaveThisArticle.bind(this, hello),
                    this.onSaveThisArticleError.bind(this, "goodbye"),
                    this.userData,
                    config.page.pageId, shortUrl));
        }
    };

    // Configure the save for later links on a front or in a container
    SaveForLater.prototype.renderContainerLinks  = function(signedIn, context) {
        var self = this,
            elements = self.getElementsIndexedById(context);
        console.log("+++ Elements: " + elements.length);

        fastdom.read(function() {

            //TODO inline id
            _.forEach(elements, function (node) {
                console.log("Element: ");
                var $node = bonzo(node),
                    id = $node.attr('data-id'),
                    shortUrl = $node.attr('data-loyalty-short-url'),
                    isSavedAlready = signedIn ? self.hasUserSavedArticle(self.userData.articles, shortUrl) : false,
                    saveUrl = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
                        '&shortUrl=' + shortUrl + '&articleId=' + id,
                    templateName = self.templates[signedIn ? "signedIn" : "signedOut"],
                    linkText = isSavedAlready ? "Saved" : "Save",
                    html,
                    meta,
                    $container;

                console.log("++ Vars set");
                html = template(templateName, {
                    link_text: linkText,
                    url: saveUrl
                });
                console.log("++ Template pop");


                meta = qwery('.js-item__meta', node);
                console.log("++ Meta");


                $container = meta.length ? bonzo(meta) : $node;

                console.log("++ Containter 2");

                fastdom.write(function () {
                    $container.append(html);
                    if (signedIn) {
                        var saveLink = $('.save-for-later-link', node)[0];
                        if (isSavedAlready) {
                            self.createDeleteArticleHandler(saveLink,id, shortUrl);
                        } else {
                            self.createSaveArticleHandler(saveLink, id, shortUrl);
                        }
                    }
                });
                console.log("++ Written");
            });
        });
        console.log("++ Dom Done");
    };

        //--- Get articles
    // -------------------------Save Article

    SaveForLater.prototype.saveThisArticle = function (onArticleSaved, onArticleSavedError, userData, pageId, shortUrl) {
        var self = this,
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: pageId, shortUrl: shortUrl, date: date, read: false  };
        console.log("++ Click");

        userData.articles.push(newArticle);

        identity.saveToArticles(userData).then(
            function(resp) {
                if(resp.status === 'error') {
                     console.log("Resp Failure");
                     onArticleSavedError();
                }
                else {
                    console.log("Resp success");
                    self.updateArticleCount();
                    onArticleSaved();
                }
            }
        );
    };

    SaveForLater.prototype.deleteArticle = function (onArticleDeleted, onArticleDeletedError, userData, pageId, shortUrl) {
        var self = this;

        userData.articles = _.filter(userData.articles, function (article) {
            return article.shortUrl !== shortUrl;
        });

        identity.saveToArticles(userData).then(
            function(resp) {
                if(resp.status === 'error') {
                     console.log("Delete Resp Failure");
                     onArticleDeletedError();
                }
                else {
                    console.log("Delete success");
                    self.updateArticleCount();
                    onArticleDeleted();
                }
            }
        );
    };

    //If this is an article Page, configure the save article link


    SaveForLater.prototype.onSaveThisArticle = function (message) {
        console.log("++++++++++++++ Sucees " + message);
        this.renderSaveThisArticleLink(false, this.savedArticlesUrl, 'saved');
    };

    SaveForLater.prototype.onSaveThisArticleError = function(message) {
        console.log("++++++++++++++ Error " + message);
        this.renderSaveThisArticleLink(true, '', 'save');
    };

    //--- Handle saving an article on a front of container
    SaveForLater.prototype.onSaveArticle = function (saveLink, id, shortUrl) {
        var self = this;
        console.log("On Save article: " + id );
        bonzo(qwery('.save-for-later-link__heading', saveLink)[0]).html('Saved');
        self.createDeleteArticleHandler(saveLink, id, shortUrl);
    };

    SaveForLater.prototype.onSaveArticleError = function (saveLink, id, shortUrl) {
        var self = this;
        console.log("On Save article error: " + id );
        bonzo(qwery('.save-for-later-link__heading', saveLink)[0]).html('Error Saving');
        self.createSaveArticleHandler(saveLink, id, shortUrl);
    };

    SaveForLater.prototype.onDeleteArticle = function (deleteLink, id, shortUrl) {
        var self = this;
        console.log("Un Save article: " + id );
        bonzo(qwery('.save-for-later-link__heading', deleteLink)[0]).html('Save');
        self.createDeleteArticleHandler(deleteLink, id, shortUrl);
    };

    SaveForLater.prototype.onDeleteArticleError = function (deleteLink, id, shortUrl) {
        var self = this;
        console.log("Error Un Save article: " + id );
        bonzo(qwery('.save-for-later-link__heading', deleteLink)[0]).html('Error Removing');
        self.createDeleteArticleHandler(deleteLink, id, shortUrl);
    };

    //--Create container link click handlers
    SaveForLater.prototype.createSaveArticleHandler = function(saveLink, id, shortUrl) {
        var self = this;

        console.log("Creating handla for " + id);
        bean.one(saveLink, 'click',
            self.saveThisArticle.bind(self,
                self.onSaveArticle.bind(self, saveLink, id, shortUrl),
                self.onSaveArticleError.bind(self, saveLink, id, shortUrl),
                self.userData,
                id,
                shortUrl
            )
        );
    };


    SaveForLater.prototype.createDeleteArticleHandler = function(deleteLink, id, shortUrl) {
        var self = this;

        console.log("Creating delete handla for " + id);
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

    SaveForLater.prototype.updateArticleCount = function() {
        var self = this,
            saveForLaterProfileLink = $('.brand-bar__item--saved-for-later');

        saveForLaterProfileLink.html('Saved (' + self.userData.articles.length + ')')
    };

    return SaveForLater;
});
