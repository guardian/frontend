define(function() {

    var CommentBlocker = {};

    CommentBlocker.hideComments = function(shortUrlSlug) {

        var sUrlInt = shortUrlSlug ? shortUrlSlug.split('').reduce(function(sum, ch) {
            return sum + ch.charCodeAt(0);
        }, 0) : 2;

        return sUrlInt % 2 == 0;
    };

    return CommentBlocker;
});
