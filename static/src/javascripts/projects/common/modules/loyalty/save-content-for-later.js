define([
    'bean',
    'bonzo',
    'qwery',

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
        console.log("++ Render: " + this.elements.length);

        //TODO inline id
        _.forEach(this.elements, function(node) {
            var $node = bonzo(node),
                id = $node.attr('data-id'),
                shortUrl = $node.attr('data-loyalty-short-url'),
                html,
                meta,
                $container,
                isSavedAlready = self.hasUserSavedArticle(self.userData.articles, shortUrl),
                saveUrl = config.page.idUrl + '/save-content?returnUrl=' + encodeURIComponent(document.location.href) +
            '&shortUrl=' + shortUrl + '&articleId=' + id,
                templateName = self.templates[signedIn ? "signedIn" : "signedOut"],
                linkText = isSavedAlready ? "Saved" : "Save";

            html = template(templateName, {
                link_text: linkText,
                url: saveUrl
            });

            console.log("Htm");
            meta = qwery('.js-item__meta', node);

            console.log("meta");
            $container = meta.length ? bonzo(meta) : $node;
            console.log("containre");
            $container.append(html)
            console.log("append");
            if (signedIn) {
                bean.on(node, 'click', '.save-for-later-link', self.saveArticleClick.bind(self, $node, node));
                console.log("handler set");
            }
            console.log("Htm");

        });
    };

    SaveForLater.prototype.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };


    SaveForLater.prototype.saveArticleClick = function($node, node){

        console.log("Click id " + $node.attr('data-loyalty-short-url') + "shortUrl: " + $node.attr('data-id'));
        var self = this,
        //Identity api needs a string in the format yyyy-mm-ddThh:mm:ss+hh:mm  otherwise it barfs
            date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: $node.attr('data-id'), shortUrl: $node.attr('data-loyalty-short-url'), date: date, read: false  };

        self.userData.articles.push(newArticle);

        identity.saveToArticles(self.userData).then(
            function success(resp) {
                if (resp.status === 'error') {
                    console.log("Error response");
                } else {
                   console.log("success response");
                }
            }
        );
    };


    SaveForLater.prototype.init = function() {
        console.log("++ Init");

        this.elements = this.getElementsIndexedById(document.body);
        console.log("++ Element");
        if (identity.isUserLoggedIn()) {
            console.log("Signed it")
            this.getSavedArticles();
        } else {
            this.renderSaveLinks(false);
        }
    };

    SaveForLater.prototype.getSavedArticles = function () {
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
                console.log("++ Got saved articles");
                self.renderSaveLinks(true);
            }
        );
    };



    return SaveForLater;
});
