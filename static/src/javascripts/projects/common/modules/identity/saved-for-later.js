define([
    'common/utils/$',
    'qwery',
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/save-for-later/delete-all-button.html'
], function (
    $,
    qwery,
    bonzo,
    bean,
    fastdom,
    config,
    mediator,
    template,
    svgs,
    deleteButtonAllTmp) {
    return function SavedForLater() {
        this.init = function () {
            var self = this,
                deleteAll = $('.js-save-for-later__delete-all')[0];

            if (deleteAll) {
                this.renderDeleteButton('delete');
                bean.one(deleteAll, 'click', '.js-save-for-later__button', function (event) {
                    event.preventDefault();
                    self.renderDeleteButton('confirm');
                });
            }
        };

        this.renderDeleteButton = function (state) {
            fastdom.read(function () {
                var $button = bonzo(qwery('.js-save-for-later__delete-all')[0]);

                fastdom.write(function () {
                    $button.html(template(deleteButtonAllTmp, {
                        icon: svgs('crossIcon'),
                        state: state,
                        dataLinkName: 'saved | remove all' + (state === 'confirm' ? ' | confirm' : '')
                    }));
                });
            });
            if (state === 'confirm') {
                setTimeout(this.init.bind(this), 2000);
            }
        };
    };
});
