define([
    'common/utils/config',
    'lodash/collections/reduce'
], function(
    config,
    reduce
) {

    var CommentBlocker = {};

    CommentBlocker.hideComments = function() {

        console.log("+++++++++++++++++++++++++++++++ GETIR!!!!!!!!!!!!!!")
        var shortUrl = (config.page.shortUrl || '').replace('http://gu.com', '');
            sUrlInt = reduce(shortUrl.split(''), function(sum, ch) {
            return sum + ch.charCodeAt(0);
        }, 0);

        console.log("+++ Code for "  + shortUrl + " " + sUrlInt)
        return sUrlInt % 2 == 0;
    };

    return CommentBlocker;
});
