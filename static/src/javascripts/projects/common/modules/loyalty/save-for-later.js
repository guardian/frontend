define([
       'qwery',
       'bonzo',
       'bean',
       'common/utils/_',
       'common/utils/config',
       'common/modules/identity/api'

], function (
        qwery,
        bonzo,
        bean,
        _,
        config,
        identity
    ){

    function SaveForLater() {
        this.saveLinkHolder = document.body.querySelector('.meta__save-for-later');
        this.userData = null;
        this.encodedPageUrl = encodeURIComponent(document.location.href);
        this.$saver = bonzo(this.saveLinkHolder)
    }



    SaveForLater.prototype.init = function() {
        console.log("++ Save init");


        if(identity.isUserLoggedIn()) {
            this.getSavedArticles();
            console.log("++ Got saved");
        }  else {
            var url = config.page.idUrl + '/prefs/save-content?returnUrl='+this.encodedPageUrl+'&shortUrl='+config.page.shortUrl;
            this.$saver.html(
                '<a href="' + url + ' "data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>'
            );
        }
        console.log("++ Done!");
    };

    SaveForLater.prototype.getSavedArticles = function() {
        var notFound  = [{message:"Not found",description:"Resource not found"}];
        var self = this;

        identity.getUsersSavedDocuments().then(
            function success(resp) {
                if (resp.status === 'error') {
                    if( JSON.stringify(notFound) ===  JSON.stringify(resp.errors)) {
                        self.userData = {articles:[]};
                    }
                }
                else {
                    self.userData = resp.savedArticles;
                }
                console.log("++  SavedArticles: " + JSON.stringify(self.userData));
                var saved = self.hasŬserSavedArticle(self.userData.articles, config.page.shortUrl);
                if (saved) {
                    console.log("++ Saved");
                    self.$saver.html('<a href="/savedListUrl" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Signed inr</a>');
                } else {
                    console.log("++ Not a saved article");
                    self.$saver.html('<a href="meta__save-for-later--link" data-link-name="meta-save-for-later" data-component=meta-save-for-later">Signed inr</a>');
                }
            }
        );
    };

    SaveForLater.prototype.hasŬserSavedArticle = function(articles, shortUrl) {
        console.log("++ Short url: " + shortUrl + " Articles: " + JSON.stringify(articles) );
        return _.some(articles, function(article) {
            return article.shortUrl == shortUrl
        })
    };

    SaveForLater.prototype.saveArticle = function() {
        console.log("++ Savi it");
    };

    return SaveForLater;
});
