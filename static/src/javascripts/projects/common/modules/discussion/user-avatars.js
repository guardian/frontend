define([
    'common/utils/$',
    'bonzo',
    'common/modules/avatar/api',
    'common/utils/config'
], function ($, bonzo, avatarApi, config) {

    function init() {
        $('.user-avatar').each(avatarify);
    }

    function avatarify(el) {
        var container = bonzo(el),
            updating = bonzo(bonzo.create('<div class="is-updating"></div>')),
            avatar = bonzo(bonzo.create('<img class="user-avatar__image" alt="" />')),
            userId = container.data('userid'),
            ownAvatar = userId === parseInt(config.user.id);

        var updateCleanup = function () {
            updating.remove();
            avatar.appendTo(container);
        };

        container
            .removeClass('is-hidden');

        updating
            .css('display', 'block')
            .appendTo(container);

        if (ownAvatar) {
            avatarApi.getActive()
                .then(function (response) {
                    avatar.attr('src', response.data.avatarUrl);
                }, function () {
                    avatar.attr('src', avatarApi.deterministicUrl(userId));
                })
                .always(function () {
                    updateCleanup();
                });
        } else {
            avatar.attr('src', avatarApi.deterministicUrl(userId));
            updateCleanup();
        }
    }

    return {init: init, avatarify: avatarify};
});
