define([
    'common/utils/$',
    'qwery',
    'bonzo',
    'bean',
    'common/utils/_',
    'fastdom',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/views/svgs',
    'common/views/identity/saved-for-later-profile-link.html!text',
    'common/views/loyalty/save-for-later--delete-all-button.html!text'
], function (
    $,
    qwery,
    bonzo,
    bean,
    _,
    fastdom,
    config,
    mediator,
    template,
    identity,
    svgs,

    profileLinkTmp,
    deleteButtonAllTmp

) {
    function SavedForLater() {

        this.init = function () {
            var self = this,
                deleteAll = $('.js-save-for-later__delete-all')[0];

            if (deleteAll) {
                this.renderDeleteButton('delete-all');
                bean.one(deleteAll, 'click', '.save-for-later__button', function (event) {
                    event.preventDefault();
                    self.renderDeleteButton('confirm-delete-all');
                });
            }
        };

        this.renderDeleteButton = function (state) {
            fastdom.read(function () {
                var $button = bonzo(qwery('.js-save-for-later__delete-all')[0]);

                fastdom.write(function () {
                    $button.html(template(deleteButtonAllTmp, {
                        icon: svgs('bookmark', ['i-left']),
                        state: state
                    }));
                });
            });
        };
    }

    return SavedForLater;
});
