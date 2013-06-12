define([
    'common'
], function (
    common
) {

    var CommentCount = function(options) {


        return {
            init: function() {

            },


            getCommentCount: function(callback) {
                common.ajax({
                    url: "/discussion/comment-count?shortUrls=/p/37v3a,/p/36qah",
                    type: 'json',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        //console.log(response);
                    }
                });
            }
        };

    };

    return CommentCount;

});
