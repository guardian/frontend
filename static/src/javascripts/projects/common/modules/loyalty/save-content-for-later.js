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

    function SaveForLater() {
        this.userData = {version: 0, articles:[]};
        this.elements = [];
        this.templates = {
            signedIn: signedInLinkTemplate,
            signedOut: signedOutLinkTemplate
        };
        this.attributeName = 'data-loyalty-short-url';
    };

    SaveForLater.prototype.getElementsIndexedById = function (context) {
        console.log("++ Elements");
        var self = this,
            elements = qwery('[' + self.attributeName + ']', context);
        console.log("++ got elElements : " + elements.length);

        return _.forEach(elements, function(el){
            return bonzo(el).attr(self.attributeName)
        });
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
            }
        );
    };

    SaveForLater.prototype.renderSaveLinks  = function(signedIn) {
        var self = this;

        console.log("++Fast");
        fastdom.read(function() {
            console.log("++ Render: " + self.elements.length + "Signed " + signedIn);

            //TODO inline id
            _.forEach(self.elements, function (node) {
                console.log("Hi:" );
                console.log("Hello " + signedIn);
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

                    console.log("vars");
                html = template(templateName, {
                    link_text: linkText,
                    url: saveUrl
                });

                console.log("Htm");
                meta = qwery('.js-item__meta', node);

                console.log("meta");

                $container = meta.length ? bonzo(meta) : $node;
                console.log("containre");

                fastdom.write(function () {
                    $container.append(html);
                    console.log("append");

                    if (signedIn) {
                        var saveLink = $('.save-for-later-link', node)[0];
                        if (isSavedAlready) {
                            bean.one(saveLink, 'click', self.unSaveArticleClick.bind(self, saveLink, id, shortUrl));
                        } else {
                            bean.one(saveLink, 'click', self.saveArticleClick.bind(self, saveLink, id, shortUrl));
                        }
                        console.log("handler set");
                    }
                    console.log("Html");
                });
            });
            console.log("Done elements");
        });
        console.log("Done fast");
    };

    SaveForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        var self = this;
        console.log("Articles: " + JSON.stringify(articles) + "U " + shortUrl)
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };


    SaveForLater.prototype.saveArticleClick = function (saveLink, id, shortUrl){

        console.log("Click id " + id + "shortUrl: " + shortUrl);
        var self = this,
        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: id, shortUrl: shortUrl, date: date, read: false  };

        self.userData.articles.push(newArticle);

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                    console.log("Error response");
                } else {
                    console.log("success response");
                    bonzo(qwery('.save-for-later-link__heading', saveLink)[0]).html('Saved');
                    console.log("saved");
                    bean.one(saveLink, 'click', self.unSaveArticleClick.bind(self, saveLink, id, shortUrl));
                    console.log("bean reset");
                }
            }
        );
    };

    SaveForLater.prototype.unSaveArticleClick = function(unsaveLink, id, shortUrl) {
        console.log("Unsave article ; " + unsaveLink);
        var self = this;

        self.userData.articles = _.filter(self.userData.articles, function (article) {
             return article.shortUrl !== shortUrl;
        });

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                    console.log("Error response");
                } else {
                    console.log("success response");
                    bonzo(qwery('.save-for-later-link__heading', unsaveLink)[0]).html('Save');
                    console.log("unsaved saved");
                    bean.one(unsaveLink, 'click', self.saveArticleClick.bind(self, unsaveLink, id, shortUrl));
                }
            }
        );
    };

    SaveForLater.prototype.init = function() {

        console.log("++ Init");

        var self = this;

        this.elements = this.getElementsIndexedById(document.body);
        console.log("++ Element");
        var userLoggedIn = identity.isUserLoggedIn();
        if (userLoggedIn) {
            console.log("Signed it");
            this.getSavedArticles();
        } else {
            this.renderSaveLinks(false);
        }

        mediator.on('modules:related:loaded', function() {
            self.elements = self.getElementsIndexedById(document.body);
            self.renderSaveLinks(userLoggedIn);
        });

    };

    SaveForLater.prototype.getSavedArticles = function () {
        var self = this,
            notFound = {message: 'Not found', description: 'Resource not found'};

        identity.getSavedArticles().then(
            function success(resp) {
                if (resp.status === 'error') {
                    console.log("Ai Error");
                    if (resp.errors[0].message === notFound.message && resp.errors[0].description === notFound.description) {
                        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
                        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00');
                        self.userData = {version: date, articles: []};
                    }
                } else {
                    console.log("Api success");
                    self.userData = resp.savedArticles;
                }
                console.log("++ Got saved articles");
                self.renderSaveLinks(true);
            }
        );
    };

    return SaveForLater;
});
