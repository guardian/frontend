define([
    '$',
    'bonzo',
    'modules/discussion/api'
], function($, bonzo, discussionApi){

    function init() {
        $(".user-avatar").each(function(){
            var container = bonzo(this),
                updating = bonzo(bonzo.create("<div class='is-updating'></div>")),
                avatar = bonzo(bonzo.create("<img />")),
                userId = container.data("userid");
            container
                .css("display", "block");
            updating
                .css("display", "block")
                .appendTo(container);
            discussionApi.getUser(userId)
                .then(function(response){
                    avatar.attr("src", response.userProfile.secureAvatarUrl);
                    updating.remove();
                    avatar.appendTo(container);
                });
        });
    }

    return {init: init};
});
