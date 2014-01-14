define([
    'common/$',
    'bonzo',
    'common/modules/discussion/api'
], function($, bonzo, discussionApi){

    function init() {
        $(".user-avatar").each(avatarify);
    }

    function avatarify(el){
        var container = bonzo(el),
            updating = bonzo(bonzo.create("<div class='is-updating'></div>")),
            avatar = bonzo(bonzo.create("<img class='user-avatar__image' alt=''/>")),
            userId = container.data("userid");
        container
            .removeClass("is-hidden");
        updating
            .css("display", "block")
            .appendTo(container);
        discussionApi.getUser(userId)
            .then(function(response){
                avatar.attr("src", response.userProfile.secureAvatarUrl);
                updating.remove();
                avatar.appendTo(container);
            });
    }

    return {init: init, avatarify: avatarify};
});
