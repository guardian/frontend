define(['common/modules/identity/api'],function(identity){
    var SaveForLater = {};

    SaveForLater.hasUserSavedArticle = function (articles, shortUrl) {
        return _.some(articles, function (article) {
            return article.shortUrl.indexOf(shortUrl) > -1;
        });
    };

    SaveForLater.saveArticle = function (callback, userData, pageId, shortUrl) {
        var date = new Date().toISOString().replace(/\.[0-9]+Z/, '+00:00'),
            newArticle = {id: pageId, shortUrl: shortUrl, date: date, read: false  };

        userData.articles.push(newArticle);

        identity.saveToArticles(userData).then(
            callback
        );
    };


    return SaveForLater;
});
