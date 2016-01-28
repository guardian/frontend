define([
    'common/utils/$',
    'bonzo',
    'common/modules/avatar/api'
], function ($, bonzo, avatarApi) {

    function init() {
        $('.user-avatar').each(avatarify);
    }

    function avatarify(el) {
        var container = bonzo(el),
            updating = bonzo(bonzo.create('<div class="is-updating"></div>')),
            avatar = bonzo(bonzo.create('<img class="user-avatar__image" alt="" />'));

        container
            .removeClass('is-hidden');

        updating
            .css('display', 'block')
            .appendTo(container);

        avatarApi.getActive()
            .then(function (response) {
                avatar.attr('src', response.data.avatarUrl);
                updating.remove();
                avatar.appendTo(container);
            });
    }

    return {init: init, avatarify: avatarify};
});
