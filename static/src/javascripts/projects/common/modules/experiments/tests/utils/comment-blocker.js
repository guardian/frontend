define([
    'common/utils/config',
    'lodash/collections/reduce'
], function(
    config,
    reduce
) {

    var CommentBlocker = {};

    CommentBlocker.hideComments = function(shortUrlSlug) {
        
        var sUrlInt = shortUrlSlug ? reduce(shortUrlSlug.split(''), function(sum, ch) {
            return sum + ch.charCodeAt(0);
        }, 0) : 2;

        return sUrlInt % 2 == 0;
    };

    return CommentBlocker;
});
