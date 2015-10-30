define([
    'bean',
    'common/utils/$'
], function (
    bean,
    $
) {
    return {
        init: function () {
            this.bindEvents();
        },

        bindEvents: function () {
            bean.on(document.body, 'click', '.js-toggle-chapters', function (e) {
                this.toggleChapters();
            }.bind(this));
        },

        toggleChapters: function () {
            $('.chapters').toggleClass('is-expanded');
        }
    };
});
